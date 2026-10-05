"use strict";

const {
  applicationDefault,
  initializeApp,
} = require("firebase-admin/app");

const {
  FieldValue,
  getFirestore,
} = require("firebase-admin/firestore");

const {
  programs,
  target,
} = require("../content/catalog");

const {
  assertImportTarget,
  prepareCredentials,
  authenticationError,
} = require("./catalogCredentials");


const DOCUMENT_ID_PATTERN =
  /^[a-z0-9][a-z0-9-]{1,126}[a-z0-9]$/;

const VALID_STATUSES = new Set([
  "draft",
  "published",
  "archived",
]);

const VALID_SECTION_TYPES = new Set([
  "content",
  "multipleChoice",
  "question",
  "reflection",
  "summary",
  "task",
  "classification",
]);

const MAX_LESSONS_PER_PROGRAM = 450;


/* =====================================================
   OPTIONS
===================================================== */

function readOption(name) {
  const optionIndex =
    process.argv.indexOf(`--${name}`);

  if (optionIndex === -1) {
    return "";
  }

  return String(
    process.argv[optionIndex + 1] || ""
  ).trim();
}


function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}


function readOwnerUid() {
  const namedOwnerUid =
    readOption("owner-uid");

  if (namedOwnerUid) {
    return namedOwnerUid;
  }

  return (
    process.argv
      .slice(2)
      .find(
        (argument) =>
          !argument.startsWith("-")
      ) || ""
  );
}


/* =====================================================
   BASIC VALIDATION
===================================================== */

function requireText(
  value,
  path,
  errors
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    errors.push(
      `${path} must be a non-empty string.`
    );
  }
}


function validateLocalized(
  value,
  path,
  errors
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    errors.push(
      `${path} must be an object with en and ar text.`
    );

    return;
  }

  requireText(
    value.en,
    `${path}.en`,
    errors
  );

  requireText(
    value.ar,
    `${path}.ar`,
    errors
  );
}


function validateIdentifier(
  value,
  path,
  errors
) {
  if (
    typeof value !== "string" ||
    !DOCUMENT_ID_PATTERN.test(value)
  ) {
    errors.push(
      `${path} must use 3-128 lowercase letters, numbers, or hyphens.`
    );
  }
}


function validateNonNegativeNumber(
  value,
  path,
  errors
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    errors.push(
      `${path} must be a non-negative number.`
    );
  }
}


function validateHexColor(
  value,
  path,
  errors
) {
  if (
    typeof value !== "string" ||
    !/^#[0-9a-fA-F]{6}$/.test(value)
  ) {
    errors.push(
      `${path} must be a six-digit hexadecimal color.`
    );
  }
}


/* =====================================================
   SECTION VALIDATION
===================================================== */

function validateSection(
  section,
  path,
  seenSectionIds,
  errors
) {
  if (
    !section ||
    typeof section !== "object" ||
    Array.isArray(section)
  ) {
    errors.push(
      `${path} must be an object.`
    );

    return;
  }


  validateIdentifier(
    section.id,
    `${path}.id`,
    errors
  );


  if (
    seenSectionIds.has(section.id)
  ) {
    errors.push(
      `${path}.id duplicates another section in this lesson.`
    );
  }

  seenSectionIds.add(section.id);


  validateLocalized(
    section.title,
    `${path}.title`,
    errors
  );


  /* -------------------------
     SUPPORTED TYPE
  ------------------------- */

  if (
    !VALID_SECTION_TYPES.has(
      section.type
    )
  ) {
    errors.push(
      `${path}.type is not supported by the lesson player.`
    );

    return;
  }


  /* -------------------------
     CONTENT TYPES
  ------------------------- */

  if (
    [
      "content",
      "summary",
      "task",
      "classification",
    ].includes(section.type)
  ) {
    validateLocalized(
      section.content,
      `${path}.content`,
      errors
    );
  }


  /* -------------------------
     QUESTION TYPES
  ------------------------- */

  if (
    [
      "multipleChoice",
      "question",
      "reflection",
    ].includes(section.type)
  ) {
    validateLocalized(
      section.question,
      `${path}.question`,
      errors
    );
  }


  /* =====================================================
     MULTIPLE CHOICE
  ===================================================== */

  if (
    section.type ===
    "multipleChoice"
  ) {
    if (
      !Array.isArray(
        section.options
      ) ||
      section.options.length < 2
    ) {
      errors.push(
        `${path}.options must contain at least two answers.`
      );

      return;
    }


    section.options.forEach(
      (
        option,
        optionIndex
      ) => {
        validateLocalized(
          option,
          `${path}.options[${optionIndex}]`,
          errors
        );
      }
    );


    if (
      !Number.isInteger(
        section.correctAnswer
      ) ||
      section.correctAnswer < 0 ||
      section.correctAnswer >=
        section.options.length
    ) {
      errors.push(
        `${path}.correctAnswer must point to a valid option index.`
      );
    }
  }


  /* =====================================================
     CLASSIFICATION
  ===================================================== */

  if (
    section.type ===
    "classification"
  ) {
    /* -------------------------
       Categories
    ------------------------- */

    if (
      !Array.isArray(
        section.categories
      ) ||
      section.categories.length < 2
    ) {
      errors.push(
        `${path}.categories must contain at least two categories.`
      );

      return;
    }


    const categoryIds =
      new Set();


    section.categories.forEach(
      (
        category,
        categoryIndex
      ) => {
        const categoryPath =
          `${path}.categories[${categoryIndex}]`;


        if (
          !category ||
          typeof category !==
            "object" ||
          Array.isArray(category)
        ) {
          errors.push(
            `${categoryPath} must be an object.`
          );

          return;
        }


        validateIdentifier(
          category.id,
          `${categoryPath}.id`,
          errors
        );


        validateLocalized(
          category.label,
          `${categoryPath}.label`,
          errors
        );


        if (
          categoryIds.has(
            category.id
          )
        ) {
          errors.push(
            `${categoryPath}.id duplicates another category.`
          );
        }


        categoryIds.add(
          category.id
        );
      }
    );


    /* -------------------------
       Items
    ------------------------- */

    if (
      !Array.isArray(
        section.items
      ) ||
      section.items.length < 1
    ) {
      errors.push(
        `${path}.items must contain at least one item.`
      );

      return;
    }


    const itemIds =
      new Set();


    section.items.forEach(
      (
        item,
        itemIndex
      ) => {
        const itemPath =
          `${path}.items[${itemIndex}]`;


        if (
          !item ||
          typeof item !==
            "object" ||
          Array.isArray(item)
        ) {
          errors.push(
            `${itemPath} must be an object.`
          );

          return;
        }


        validateIdentifier(
          item.id,
          `${itemPath}.id`,
          errors
        );


        validateLocalized(
          item.label,
          `${itemPath}.label`,
          errors
        );


        if (
          itemIds.has(
            item.id
          )
        ) {
          errors.push(
            `${itemPath}.id duplicates another classification item.`
          );
        }


        itemIds.add(
          item.id
        );


        if (
          typeof
            item.correctCategory !==
            "string" ||
          !categoryIds.has(
            item.correctCategory
          )
        ) {
          errors.push(
            `${itemPath}.correctCategory must match a valid category id.`
          );
        }
      }
    );
  }
}


/* =====================================================
   LESSON VALIDATION
===================================================== */

function validateLesson(
  lesson,
  path,
  seenLessonIds,
  errors
) {
  if (
    !lesson ||
    typeof lesson !== "object" ||
    Array.isArray(lesson)
  ) {
    errors.push(
      `${path} must be an object.`
    );

    return;
  }


  validateIdentifier(
    lesson.id,
    `${path}.id`,
    errors
  );


  if (
    seenLessonIds.has(
      lesson.id
    )
  ) {
    errors.push(
      `${path}.id duplicates another lesson in this program.`
    );
  }

  seenLessonIds.add(
    lesson.id
  );


  validateLocalized(
    lesson.title,
    `${path}.title`,
    errors
  );


  validateLocalized(
    lesson.description,
    `${path}.description`,
    errors
  );


  requireText(
    lesson.coverImage,
    `${path}.coverImage`,
    errors
  );


  validateLocalized(
    lesson.imageAlt,
    `${path}.imageAlt`,
    errors
  );


  validateHexColor(
    lesson.themeColor,
    `${path}.themeColor`,
    errors
  );


  validateHexColor(
    lesson.accentColor,
    `${path}.accentColor`,
    errors
  );


  validateHexColor(
    lesson.surfaceColor,
    `${path}.surfaceColor`,
    errors
  );


  validateNonNegativeNumber(
    lesson.xp,
    `${path}.xp`,
    errors
  );


  if (
    typeof lesson.minutes !==
      "number" ||
    !Number.isFinite(
      lesson.minutes
    ) ||
    lesson.minutes <= 0
  ) {
    errors.push(
      `${path}.minutes must be greater than zero.`
    );
  }


  if (
    !VALID_STATUSES.has(
      lesson.status
    )
  ) {
    errors.push(
      `${path}.status must be draft, published, or archived.`
    );
  }


  if (
    !Array.isArray(
      lesson.sections
    )
  ) {
    errors.push(
      `${path}.sections must be an array.`
    );
  } else if (
    lesson.sections.length >
    300
  ) {
    errors.push(
      `${path}.sections cannot contain more than 300 sections.`
    );
  } else {
    const seenSectionIds =
      new Set();


    lesson.sections.forEach(
      (
        section,
        sectionIndex
      ) => {
        validateSection(
          section,
          `${path}.sections[${sectionIndex}]`,
          seenSectionIds,
          errors
        );
      }
    );
  }
}


/* =====================================================
   CATALOG VALIDATION
===================================================== */

function validateCatalog() {
  const errors = [];

  const seenProgramIds =
    new Set();


  if (
    !Array.isArray(programs)
  ) {
    return [
      "catalog.programs must be an array.",
    ];
  }


  programs.forEach(
    (
      program,
      programIndex
    ) => {
      const path =
        `programs[${programIndex}]`;


      if (
        !program ||
        typeof program !==
          "object" ||
        Array.isArray(program)
      ) {
        errors.push(
          `${path} must be an object.`
        );

        return;
      }


      validateIdentifier(
        program.id,
        `${path}.id`,
        errors
      );


      if (
        seenProgramIds.has(
          program.id
        )
      ) {
        errors.push(
          `${path}.id duplicates another program.`
        );
      }

      seenProgramIds.add(
        program.id
      );


      validateLocalized(
        program.title,
        `${path}.title`,
        errors
      );


      validateLocalized(
        program.description,
        `${path}.description`,
        errors
      );


      validateLocalized(
        program.finalProject,
        `${path}.finalProject`,
        errors
      );


      if (
        !VALID_STATUSES.has(
          program.status
        )
      ) {
        errors.push(
          `${path}.status must be draft, published, or archived.`
        );
      }


      if (
        !Number.isInteger(
          program.ageFrom
        ) ||
        program.ageFrom < 3
      ) {
        errors.push(
          `${path}.ageFrom must be an integer of at least 3.`
        );
      }


      if (
        !Number.isInteger(
          program.ageTo
        ) ||
        program.ageTo <
          program.ageFrom
      ) {
        errors.push(
          `${path}.ageTo must be an integer not below ageFrom.`
        );
      }


      const pricing =
        program.pricing || {};


      validateNonNegativeNumber(
        pricing.student,
        `${path}.pricing.student`,
        errors
      );


      validateNonNegativeNumber(
        pricing.teacher,
        `${path}.pricing.teacher`,
        errors
      );


      validateNonNegativeNumber(
        pricing.class,
        `${path}.pricing.class`,
        errors
      );


      if (
        !Array.isArray(
          program.lessons
        )
      ) {
        errors.push(
          `${path}.lessons must be an array.`
        );

        return;
      }


      if (
        program.lessons.length >
        MAX_LESSONS_PER_PROGRAM
      ) {
        errors.push(
          `${path}.lessons cannot contain more than ${MAX_LESSONS_PER_PROGRAM} lessons.`
        );
      }


      const seenLessonIds =
        new Set();


      program.lessons.forEach(
        (
          lesson,
          lessonIndex
        ) => {
          validateLesson(
            lesson,
            `${path}.lessons[${lessonIndex}]`,
            seenLessonIds,
            errors
          );
        }
      );
    }
  );


  return errors;
}


/* =====================================================
   PROGRAM DOCUMENT
===================================================== */

function programDocument(
  program,
  ownerUid,
  createdAt,
  lessonCount,
  existingData = {}
) {
  return {
    ...existingData,

    title:
      program.title,

    description:
      program.description,

    icon:
      program.icon ||
      "🚀",

    category:
      program.category ||
      "technology",

    ageFrom:
      program.ageFrom,

    ageTo:
      program.ageTo,

    level:
      program.level ||
      "beginner",

    pricing:
      program.pricing,

    purchaseOptions: {
      student: true,
      teacher: true,
      class: true,
    },

    finalProject:
      program.finalProject,

    status:
      program.status,

    sellable: true,

    programType:
      "commercial",

    createdBy:
      ownerUid,

    createdByRole:
      "owner",

    ownerName:
      program.ownerName ||
      "",

    lessonCount,

    salesCount:
      existingData.salesCount ||
      0,

    studentsCount:
      existingData.studentsCount ||
      0,

    currency:
      "ILS",

    ...(existingData.paddlePriceIds
      ? {
          paddlePriceIds:
            existingData.paddlePriceIds,
        }
      : {}),

    createdAt,

    updatedAt:
      FieldValue.serverTimestamp(),
  };
}


/* =====================================================
   LESSON DOCUMENT
===================================================== */

function lessonDocument(
  program,
  lesson,
  lessonIndex,
  ownerUid,
  createdAt,
  existingData = {}
) {
  return {
    ...existingData,

    programId:
      program.id,

    lessonType:
      "commercial",

    sellable: true,

    createdBy:
      ownerUid,

    createdByRole:
      "owner",

    title:
      lesson.title,

    description:
      lesson.description,

    coverImage:
      lesson.coverImage,

    imageAlt:
      lesson.imageAlt,

    themeColor:
      lesson.themeColor,

    accentColor:
      lesson.accentColor,

    surfaceColor:
      lesson.surfaceColor,

    minutes:
      lesson.minutes,

    xp:
      lesson.xp,

    status:
      lesson.status,

    lessonNumber:
      lessonIndex + 1,

    order:
      lessonIndex + 1,

    sections:
      lesson.sections,

    slideCount:
      lesson.sections.length,

    ...(typeof
      existingData.completedCount ===
    "number"
      ? {
          completedCount:
            existingData.completedCount,
        }
      : {}),

    createdAt,

    updatedAt:
      FieldValue.serverTimestamp(),
  };
}


/* =====================================================
   IMPORT PROGRAM
===================================================== */

async function importProgram(
  database,
  program,
  ownerUid,
  allowUpdate
) {
  const programReference =
    database
      .collection("programs")
      .doc(program.id);


  const lessonReferences =
    program.lessons.map(
      (lesson) => ({
        lesson,

        reference:
          database
            .collection("lessons")
            .doc(
              `${program.id}--${lesson.id}`
            ),
      })
    );


  const references = [
    programReference,

    ...lessonReferences.map(
      ({ reference }) =>
        reference
    ),
  ];


  const snapshots =
    await database.getAll(
      ...references
    );


  const existingDocuments =
    snapshots.filter(
      (snapshot) =>
        snapshot.exists
    );


  existingDocuments.forEach(
    (snapshot) => {
      const existingOwnerUid =
        snapshot.get(
          "createdBy"
        );


      if (
        existingOwnerUid &&
        existingOwnerUid !==
          ownerUid
      ) {
        throw new Error(
          `${snapshot.ref.path} belongs to a different owner UID. Import stopped.`
        );
      }
    }
  );


  if (
    existingDocuments.length >
      0 &&
    !allowUpdate
  ) {
    const paths =
      existingDocuments
        .map(
          (snapshot) =>
            snapshot.ref.path
        )
        .join(", ");


    throw new Error(
      `Existing documents would be updated: ${paths}. Re-run with --allow-update after reviewing them.`
    );
  }


  const batch =
    database.batch();


  const existingLessons =
    await database
      .collection("lessons")
      .where(
        "programId",
        "==",
        program.id
      )
      .get();


  const lessonIds =
    new Set(
      existingLessons.docs.map(
        (snapshot) =>
          snapshot.id
      )
    );


  lessonReferences.forEach(
    ({ reference }) =>
      lessonIds.add(
        reference.id
      )
  );


  const existingProgramData =
    snapshots[0].exists
      ? snapshots[0].data()
      : {};


  const programCreatedAt =
    snapshots[0].exists
      ? snapshots[0].get(
          "createdAt"
        )
      : FieldValue.serverTimestamp();


  batch.set(
    programReference,

    programDocument(
      program,
      ownerUid,
      programCreatedAt,
      lessonIds.size,
      existingProgramData
    )
  );


  lessonReferences.forEach(
    (
      {
        lesson,
        reference,
      },
      lessonIndex
    ) => {
      const snapshot =
        snapshots[
          lessonIndex + 1
        ];


      const createdAt =
        snapshot.exists
          ? snapshot.get(
              "createdAt"
            )
          : FieldValue.serverTimestamp();


      batch.set(
        reference,

        lessonDocument(
          program,
          lesson,
          lessonIndex,
          ownerUid,
          createdAt,
          snapshot.exists
            ? snapshot.data()
            : {}
        )
      );
    }
  );


  await batch.commit();
}


/* =====================================================
   MAIN
===================================================== */

async function main() {
  assertImportTarget(
    target
  );


  const errors =
    validateCatalog();


  if (
    errors.length >
    0
  ) {
    console.error(
      "Catalog validation failed:\n"
    );


    errors.forEach(
      (error) =>
        console.error(
          `- ${error}`
        )
    );


    process.exitCode =
      1;

    return;
  }


  console.log(
    `Catalog is valid: ${programs.length} program(s), ` +
      `${programs.reduce(
        (
          total,
          program
        ) =>
          total +
          program.lessons.length,
        0
      )} lesson(s).`
  );


  if (
    !hasFlag("commit") &&
    !hasFlag("check-auth")
  ) {
    console.log(
      "Dry run only. No Firestore data was changed."
    );

    return;
  }


  if (
    programs.length === 0
  ) {
    throw new Error(
      "The catalog is empty. Add content before importing."
    );
  }


  const ownerUid =
    readOwnerUid();


  if (!ownerUid) {
    throw new Error(
      "An owner UID is required. Use --owner-uid YOUR_FIREBASE_OWNER_UID."
    );
  }


  const credentialSource =
    await prepareCredentials();


  const credential =
    applicationDefault();


  try {
    await credential.getAccessToken();
  } catch {
    throw authenticationError();
  }


  const app =
    initializeApp(
      {
        credential,

        projectId:
          target.projectId,
      },

      "catalog-import"
    );


  const database =
    getFirestore(
      app,
      target.databaseId
    );


  let ownerSnapshot;


  try {
    ownerSnapshot =
      await database
        .collection("users")
        .doc(ownerUid)
        .get();
  } catch (error) {
    if (
      error.code === 7 ||
      error.code ===
        "permission-denied"
    ) {
      throw new Error(
        `The authenticated Google account cannot read ${target.projectId}/${target.databaseId}. ` +
          "Use a Firebase CLI account with Firestore IAM access. The app owner role alone does not grant IAM access. No import was started."
      );
    }


    throw new Error(
      "Could not verify the owner in Firestore. Check authentication and network access. No import was started."
    );
  }


  if (
    !ownerSnapshot.exists ||
    ownerSnapshot.get(
      "role"
    ) !== "owner"
  ) {
    throw new Error(
      `users/${ownerUid} is missing or is not an owner account. Import stopped.`
    );
  }


  console.log(
    `Authenticated using ${credentialSource}; owner UID verified.`
  );


  if (
    hasFlag(
      "check-auth"
    )
  ) {
    console.log(
      "Authentication check only. No Firestore data was changed."
    );

    return;
  }


  for (
    const program of programs
  ) {
    await importProgram(
      database,
      program,
      ownerUid,
      hasFlag(
        "allow-update"
      )
    );


    console.log(
      `Imported programs/${program.id} and ${program.lessons.length} lesson(s).`
    );
  }


  console.log(
    `Import complete: project ${target.projectId}, database ${target.databaseId}.`
  );
}


/* =====================================================
   RUN
===================================================== */

if (
  require.main === module
) {
  main().catch(
    (error) => {
      console.error(
        error.message ||
          "Content import failed."
      );

      process.exitCode =
        1;
    }
  );
}


/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  validateCatalog,
  programDocument,
  lessonDocument,
  importProgram,
};