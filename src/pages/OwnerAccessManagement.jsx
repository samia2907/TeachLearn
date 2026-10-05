import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { manageProgramAccess, reviewAccessRequest, assignMissionParent } from '../access/programAccessClient';
import { useAccessText } from '../access/accessText';
import './ProgramAccess.css';
import { compareProgramLessons } from '../../functions/programAccessPolicy.mjs';
import { selectableProgramLessons, programContentType } from '../../functions/programContent.mjs';

const emptyGrant = { grantType: 'manual_paid', paymentMethod: '', note: '', expiresAt: '', accessScope: 'full', lessonIds: [], rangeStart: 1, rangeEnd: 1 };
export default function OwnerAccessManagement() {
  const { t, loc, dir, language, setLanguage } = useAccessText();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('grant'); const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]); const [programs, setPrograms] = useState([]);
  const [requests, setRequests] = useState([]); const [accesses, setAccesses] = useState([]);
  const [userId, setUserId] = useState(params.get('userId') || ''); const [programId, setProgramId] = useState('');
  const [form, setForm] = useState(emptyGrant); const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('pending'); const [activeOnly, setActiveOnly] = useState(true);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [allLessons, setAllLessons] = useState([]);
  const lessons = selectableProgramLessons(allLessons, programId, { includeDrafts: true }).sort(compareProgramLessons);
  const [parentChoices, setParentChoices] = useState({});
  const lessonStatus = lesson => lesson.status === 'draft' ? t('Draft', 'مسودة', 'טיוטה') : t('Published', 'منشور', 'פורסם');
  const preservedIds = form.lessonIds.filter(id => !lessons.some(lesson => lesson.id === id));
  useEffect(() => {
    const fail = failure => { console.error('Owner access load failed', failure.code, failure.message); setError('load'); };
    // Live owner views reflect requests and grants from other tabs/owners immediately.
    const stops = [['users', setUsers], ['programs', setPrograms], ['accessRequests', setRequests], ['programAccess', setAccesses], ['lessons', setAllLessons]]
      .map(([name, set]) => onSnapshot(collection(db, name), snap => set(snap.docs.map(item => ({ ...item.data(), id: item.id }))), fail));
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { stops.forEach(stop => stop()); clearInterval(timer); };
  }, []);
  useEffect(() => {
    if (!userId || !programId || tab !== 'grant') return;
    let current = true;
    const record = accesses.find(item => item.userId === userId && item.programId === programId && item.accessType === 'manual');
    const expires = record?.expiresAt?.toDate?.();
    const localDate = expires ? new Date(expires.getTime() - expires.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
    setForm({ ...emptyGrant, accessScope: record?.accessScope || 'full', lessonIds: record?.lessonIds || [], grantType: record?.grantType || 'manual_paid', paymentMethod: record?.paymentMethod || '', expiresAt: localDate });
    getDoc(doc(db, 'programAccess', `${userId}_${programId}`, 'private', 'metadata')).then(snap => {
      if (current) setForm(value => ({ ...value, note: snap.data()?.note || '' }));
    }).catch(() => { if (current) setError('load'); });
    return () => { current = false; };
  }, [userId, programId, tab, accesses]);
  const reason = {
    manual_paid: t('Manual payment', 'دفع يدوي', 'תשלום ידני'), free_gift: t('Free gift', 'هدية مجانية', 'מתנה'),
    class_access: t('Class access', 'وصول صفّي', 'גישה לכיתה'), promotion: t('Promotion', 'عرض ترويجي', 'מבצע'), other: t('Other', 'أخرى', 'אחר'),
  };
  const statuses = { pending: t('Pending', 'قيد المراجعة', 'ממתין'), approved: t('Approved', 'مقبول', 'אושר'), rejected: t('Rejected', 'مرفوض', 'נדחה') };
  const userName = uid => { const user = users.find(item => item.id === uid); return user?.name || user?.displayName || user?.fullName || user?.username || uid; };
  const email = uid => { const user = users.find(item => item.id === uid); return user?.email || user?.authEmail || '—'; };
  const programName = pid => loc(programs.find(item => item.id === pid)?.title) || pid;
  const date = value => value?.toDate?.().toLocaleString(language) || '—';
  const valid = item => item.active === true && (!item.expiresAt || item.expiresAt.toMillis() > now);
  const matches = users.filter(user => ['student', 'teacher'].includes(user.role) &&
    [user.id, user.email, user.authEmail, user.name, user.displayName, user.fullName, user.username, user.studentCode]
      .some(value => String(value || '').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())));
  async function run(action) {
    setBusy(true); setError(''); setSuccess(false);
    try { await action(); setSuccess(true); setSelectedRequest(null); }
    catch (failure) { console.error('Access management failed', failure.code, failure.message); setError(failure.code || 'write'); }
    finally { setBusy(false); }
  }
  const options = () => ({ ...form, accessScope: form.accessScope === 'range' ? 'selected' : form.accessScope,
    lessonIds: form.accessScope === 'range' ? [...preservedIds, ...lessons.slice(Number(form.rangeStart) - 1, Number(form.rangeEnd)).map(item => item.id)] : form.lessonIds,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null });
  const scopeLabel = item => item.accessScope === 'selected'
    ? t(`${item.lessonIds?.length || 0} selected lessons`, `${item.lessonIds?.length || 0} دروس محددة`, `${item.lessonIds?.length || 0} שיעורים נבחרים`)
    : t('Full program', 'البرنامج الكامل', 'תוכנית מלאה');
  const scopeFields = <>
    {form.accessScope !== 'full' && preservedIds.length > 0 && <p>{t('Existing grants to content outside this lesson list are preserved.', 'تُحفظ صلاحيات المحتوى الموجودة خارج قائمة الدروس هذه.', 'הרשאות קיימות לתוכן שאינו ברשימת השיעורים נשמרות.')}</p>}
    <label className="access-field">{t('Access scope', 'نطاق الوصول', 'היקף גישה')}<select value={form.accessScope} onChange={e => setForm({ ...form, accessScope: e.target.value })}>
      <option value="full">{t('Full program', 'البرنامج الكامل', 'תוכנית מלאה')}</option><option value="selected">{t('Selected lessons', 'دروس محددة', 'שיעורים נבחרים')}</option><option value="range">{t('Lesson range', 'نطاق الدروس', 'טווח שיעורים')}</option>
    </select></label>
    {form.accessScope === 'selected' && <fieldset className="access-lesson-options"><legend>{t('Choose lessons', 'اختر الدروس', 'בחירת שיעורים')}</legend>{lessons.map((lesson, index) => <label key={lesson.id}><input type="checkbox" checked={form.lessonIds.includes(lesson.id)} onChange={e => setForm({ ...form, lessonIds: e.target.checked ? [...form.lessonIds, lesson.id] : form.lessonIds.filter(id => id !== lesson.id) })} /> {index + 1}. {loc(lesson.titleI18n || lesson.title) || lesson.id} <small className="access-status-badge" data-status={lesson.status}>{lessonStatus(lesson)}</small></label>)}</fieldset>}
    {form.accessScope === 'range' && <div className="access-grid">{[['rangeStart', t('Start lesson', 'الدرس الأول', 'שיעור התחלה')], ['rangeEnd', t('End lesson', 'الدرس الأخير', 'שיעור סיום')]].map(([key, label]) => <label className="access-field" key={key}>{label}<input required type="number" min={key === 'rangeEnd' ? form.rangeStart : 1} max={lessons.length} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}</div>}
    {form.accessScope !== 'full' && lessons.length === 0 && <p>{t('No draft or published lessons in this program.', 'لا توجد دروس منشورة أو مسودات في هذا البرنامج.', 'אין שיעורים שפורסמו או טיוטות בתוכנית זו.')}</p>}
  </>;
  function openUser(uid) { setUserId(uid); setSearch(''); setParams({ userId: uid }); setTab('grant'); setSelectedRequest(null); }
  async function openRequest(item) {
    setSelectedRequest(item); setForm(emptyGrant); setError('');
    try { const note = await getDoc(doc(db, 'accessRequests', item.id, 'private', 'metadata')); setForm(value => ({ ...value, note: note.data()?.note || '' })); }
    catch { setError('load'); }
  }
  const grantFields = <>
    <label className="access-field">{t('Reason / source', 'السبب / المصدر', 'סיבה / מקור')}<select value={form.grantType} onChange={e => setForm({ ...form, grantType: e.target.value })}>{Object.entries(reason).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="access-field">{t('Payment method (optional)', 'طريقة الدفع (اختياري)', 'אמצעי תשלום (לא חובה)')}<input maxLength={80} value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} /></label>
    <label className="access-field">{t('Expires at · leave empty for permanent access', 'تاريخ الانتهاء · اتركه فارغًا لوصول دائم', 'תוקף · השאירו ריק לגישה קבועה')}<input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></label>
    <label className="access-field">{t('Internal note (owner only)', 'ملاحظة داخلية (للمالك فقط)', 'הערה פנימית (לבעלים בלבד)')}<textarea rows={3} maxLength={2000} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
  </>;
  return <main className="access-page" dir={dir}>
    <header className="access-header"><div><Link to="/owner">← {t('Owner dashboard', 'لوحة المالك', 'לוח הבעלים')}</Link><h1>{t('Access Management', 'إدارة الوصول', 'ניהול גישה')}</h1><p>{t('Open a learning journey for the right account.', 'افتح رحلة تعليمية للحساب الصحيح.', 'פתחו מסע למידה עבור החשבון המתאים.')}</p></div>
      <select aria-label={t('Language', 'اللغة', 'שפה')} value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="ar">العربية</option><option value="he">עברית</option></select></header>
    <div className="access-tabs" role="tablist" aria-label={t('Access Management', 'إدارة الوصول', 'ניהול גישה')}>{[['grant', t('Grant Access', 'منح الوصول', 'הענקת גישה')], ['requests', t('Requests', 'الطلبات', 'בקשות')], ['missions', t('Mission parents', 'ربط المهمات', 'שיוך משימות')], ['active', t('Active Access', 'الوصول الفعّال', 'גישה פעילה')]].map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setSelectedRequest(null); setError(''); }}>{label}{value === 'requests' ? ` (${requests.filter(item => item.status === 'pending').length})` : ''}</button>)}</div>
    {error && <p className="access-error" role="alert">{error === 'functions/failed-precondition' ? t('The request was already reviewed, the account is inactive, or the expiration is invalid. Refresh your selection.', 'تمت مراجعة الطلب أو الحساب غير نشط أو تاريخ الانتهاء غير صالح. أعد الاختيار.', 'הבקשה כבר נבדקה, החשבון אינו פעיל או התוקף אינו תקין. בחרו מחדש.') : t('Could not complete this action. Check the details and try again.', 'تعذر إتمام العملية. تحقق من التفاصيل وحاول مجددًا.', 'לא ניתן להשלים את הפעולה. בדקו את הפרטים ונסו שוב.')}</p>}
    {success && <p className="access-success" role="status">{t('Saved successfully.', 'تم الحفظ بنجاح.', 'נשמר בהצלחה.')}</p>}
    {tab === 'missions' && <section className="access-card">
      <h2>{t('Assign mission parent lessons', 'تعيين الدروس الأساسية للمهمات', 'שיוך משימות לשיעורי אב')}</h2>
      <label className="access-field">{t('Program', 'البرنامج', 'תוכנית')}<select value={programId} onChange={e => { setProgramId(e.target.value); setParentChoices({}); }}><option value="">{t('Select a program', 'اختر برنامجًا', 'בחרו תוכנית')}</option>{programs.map(program => <option key={program.id} value={program.id}>{loc(program.title)}</option>)}</select></label>
      {allLessons.filter(item => item.programId === programId && item.lessonType === 'commercial' && programContentType(item) === 'mission').sort(compareProgramLessons).map(mission => <div className="access-detail" key={mission.id}>
        <h3>{loc(mission.titleI18n || mission.title) || mission.id}</h3>
        <p>{t('Current parent', 'الدرس الأساسي الحالي', 'שיעור אב נוכחי')}: {mission.parentLessonId ? loc(allLessons.find(item => item.id === mission.parentLessonId)?.title) || mission.parentLessonId : t('Unassigned', 'غير معيّن', 'לא משויך')}</p>
        <label className="access-field">{t('Parent lesson', 'الدرس الأساسي', 'שיעור אב')}<select disabled={busy} value={parentChoices[mission.id] ?? mission.parentLessonId ?? ''} onChange={e => setParentChoices({ ...parentChoices, [mission.id]: e.target.value })}>
          <option value="">{t('Unassigned', 'غير معيّن', 'לא משויך')}</option>{lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{loc(lesson.titleI18n || lesson.title) || lesson.id} · {lessonStatus(lesson)}</option>)}
        </select></label><button disabled={busy || !Object.hasOwn(parentChoices, mission.id)} onClick={() => run(async () => { await assignMissionParent({ programId, missionId: mission.id, parentLessonId: parentChoices[mission.id] || null }); setParentChoices(current => { const next = { ...current }; delete next[mission.id]; return next; }); })}>{t('Save', 'حفظ', 'שמירה')}</button>
      </div>)}
    </section>}
    {tab === 'grant' && <section className="access-card access-grid"><div><h2>{t('1. Choose a user', '١. اختر المستخدم', '1. בחרו משתמש')}</h2>
      <label className="access-field">{t('Search name, email, username or student code', 'ابحث بالاسم أو البريد أو اسم المستخدم أو رمز الطالب', 'חיפוש לפי שם, אימייל, שם משתמש או קוד תלמיד')}<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="access-results">{matches.slice(0, 100).map(user => <button key={user.id} aria-pressed={userId === user.id} onClick={() => openUser(user.id)}><strong>{userName(user.id)}</strong><small dir="auto">{email(user.id)} · {user.studentCode || user.username || user.role}</small></button>)}</div>
      {matches.length > 100 && <p>{t('Refine the search to show more specific results.', 'حدد البحث لعرض نتائج أدق.', 'צמצמו את החיפוש לקבלת תוצאות מדויקות.')}</p>}
      {userId && <div className="access-detail"><strong>{userName(userId)}</strong><p dir="auto">{email(userId)}</p><small>UID: <bdi>{userId}</bdi></small><p>{users.find(item => item.id === userId)?.studentCode || users.find(item => item.id === userId)?.username}</p></div>}
    </div><form onSubmit={event => { event.preventDefault(); run(() => manageProgramAccess({ action: 'grant', userId, programId, ...options() })); }}><fieldset disabled={busy} style={{ border: 0, padding: 0 }}><h2>{t('2. Configure access', '٢. إعداد الوصول', '2. הגדירו גישה')}</h2>
      <label className="access-field">{t('Program', 'البرنامج', 'תוכנית')}<select required value={programId} onChange={e => setProgramId(e.target.value)}><option value="">{t('Select a program', 'اختر برنامجًا', 'בחרו תוכנית')}</option>{programs.map(program => <option key={program.id} value={program.id}>{loc(program.title)} · {program.status}</option>)}</select></label>
      {scopeFields}{grantFields}<button className="access-primary" disabled={!userId || !programId || busy || (form.accessScope === 'selected' && !form.lessonIds.length) || (form.accessScope === 'range' && !lessons.length)}>{t('Grant / update access', 'منح / تحديث الوصول', 'הענקת / עדכון גישה')}</button>
    </fieldset></form></section>}
    {tab === 'requests' && <section className="access-card"><div className="access-toolbar"><h2>{t('Access requests', 'طلبات الوصول', 'בקשות גישה')}</h2><select aria-label={t('Status', 'الحالة', 'סטטוס')} value={status} onChange={e => setStatus(e.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="access-table-wrap"><table><thead><tr>{[t('User / email', 'المستخدم / البريد', 'משתמש / אימייל'), t('Program', 'البرنامج', 'תוכנית'), t('Date', 'التاريخ', 'תאריך'), t('Status', 'الحالة', 'סטטוס'), t('Actions', 'الإجراءات', 'פעולות')].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{requests.filter(item => item.status === status).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(item => <tr key={item.id}><td>{userName(item.userId)}<small dir="auto">{item.userEmail || '—'}</small></td><td>{programName(item.programId)}</td><td>{date(item.createdAt)}</td><td>{statuses[item.status]}</td><td><div className="access-actions"><button disabled={busy} onClick={() => openRequest(item)}>{t('Review / note', 'مراجعة / ملاحظة', 'בדיקה / הערה')}</button><button onClick={() => openUser(item.userId)}>{t('Open user', 'فتح المستخدم', 'פתיחת משתמש')}</button></div></td></tr>)}</tbody></table></div>
      {!requests.some(item => item.status === status) && <p>{t('No requests in this category.', 'لا توجد طلبات في هذه الفئة.', 'אין בקשות בקטגוריה זו.')}</p>}
      {selectedRequest && <form className="access-detail" onSubmit={event => { event.preventDefault(); run(() => reviewAccessRequest({ action: 'approve', userId: selectedRequest.userId, programId: selectedRequest.programId, ...options() })); }}><fieldset disabled={busy} style={{ border: 0 }}><h3>{userName(selectedRequest.userId)} · {programName(selectedRequest.programId)}</h3>{grantFields}<div className="access-actions">
        {selectedRequest.status === 'pending' && <><button className="access-primary" type="submit">{t('Approve + grant access', 'موافقة ومنح الوصول', 'אישור והענקת גישה')}</button><button type="button" onClick={() => run(() => reviewAccessRequest({ action: 'reject', userId: selectedRequest.userId, programId: selectedRequest.programId, note: form.note }))}>{t('Reject', 'رفض', 'דחייה')}</button></>}
        <button type="button" onClick={() => run(() => reviewAccessRequest({ action: 'note', userId: selectedRequest.userId, programId: selectedRequest.programId, note: form.note }))}>{t('Save note', 'حفظ الملاحظة', 'שמירת הערה')}</button></div></fieldset></form>}
    </section>}
    {tab === 'active' && <section className="access-card"><div className="access-toolbar"><h2>{t('Manual program access', 'الوصول اليدوي للبرامج', 'גישה ידנית לתוכניות')}</h2><label><input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} /> {t('Active only', 'الفعّال فقط', 'פעיל בלבד')}</label></div><p>{t('Revoking a manual grant preserves independent purchases, class licenses and earlier owner grants.', 'إلغاء المنح اليدوي لا يلغي المشتريات المستقلة أو تراخيص الصفوف أو منح المالك السابقة.', 'ביטול הרשאה ידנית שומר על רכישות עצמאיות, רישיונות כיתה והרשאות בעלים קודמות.')}</p>
      <div className="access-table-wrap"><table><thead><tr>{[t('User', 'المستخدم', 'משתמש'), t('Program', 'البرنامج', 'תוכנית'), t('Reason', 'السبب', 'סיבה'), t('Expiration', 'الانتهاء', 'תוקף'), t('Actions', 'الإجراءات', 'פעולות')].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{accesses.filter(item => item.accessType === 'manual' && (!activeOnly || valid(item))).map(item => <tr key={item.id}><td>{userName(item.userId)}<small dir="auto">{email(item.userId)}</small></td><td>{programName(item.programId)}<small>{valid(item) ? t('Active', 'فعّال', 'פעיל') : item.active ? t('Expired', 'منتهي', 'פג תוקף') : t('Revoked', 'ملغى', 'בוטל')}</small></td><td><strong>{scopeLabel(item)}</strong><br />{reason[item.grantType]}<small>{item.paymentMethod}</small></td><td>{item.expiresAt ? date(item.expiresAt) : t('Permanent', 'دائم', 'קבוע')}</td><td><div className="access-actions"><button disabled={busy} onClick={() => { openUser(item.userId); setProgramId(item.programId); }}>{t('Edit / note', 'تعديل / ملاحظة', 'עריכה / הערה')}</button><button disabled={busy || !item.active} onClick={() => run(() => manageProgramAccess({ action: 'revoke', userId: item.userId, programId: item.programId }))}>{t('Revoke', 'إلغاء الوصول', 'ביטול גישה')}</button></div></td></tr>)}</tbody></table></div>
    </section>}
  </main>;
}
