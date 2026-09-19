import sqlite3,concurrent.futures,tempfile,uuid
from pathlib import Path
path=tempfile.mktemp(suffix='.sqlite')
c=sqlite3.connect(path)
c.executescript(Path('drizzle/0000_black_tarot.sql').read_text())
c.execute("INSERT INTO events VALUES ('e','Test','Academic','2026-10-01T09:00:00+05:30','2099-10-01T10:00:00+05:30','Hall','Society','Test',3,'published','All')")
c.commit();c.close()
sql="""INSERT INTO registrations (id,event_id,name,email,role,status,created) SELECT ?,?,?,?,?, 'confirmed',? WHERE (SELECT COUNT(*) FROM registrations WHERE event_id=? AND status IN ('confirmed','checked-in')) < (SELECT capacity FROM events WHERE id=? AND status='published' AND julianday(ends)>julianday('now')) ON CONFLICT(event_id,email) DO UPDATE SET id=excluded.id,name=excluded.name,role=excluded.role,status='confirmed',created=excluded.created WHERE registrations.status='cancelled'"""
def reg(i):
 db=sqlite3.connect(path,timeout=10);r=db.execute(sql,(str(uuid.uuid4()),'e','Tester',f'{i}@example.com','Student','2026-09-19','e','e'));db.commit();changes=r.rowcount;db.close();return changes
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:r=list(ex.map(reg,range(12)))
assert sum(r)==3,r
c=sqlite3.connect(path);assert c.execute('SELECT COUNT(*) FROM registrations').fetchone()[0]==3
email=c.execute('SELECT email FROM registrations LIMIT 1').fetchone()[0]
c.execute("UPDATE registrations SET status='cancelled' WHERE email=?",(email,));c.commit()
assert reg(50)==1
assert reg(50)==0
c.execute("UPDATE registrations SET status='checked-in' WHERE email='50@example.com'");c.commit()
assert reg(51)==0
c.execute("UPDATE events SET status='cancelled'");c.commit()
assert reg(52)==0
print('PASS: concurrent capacity, cancellation release, duplicate prevention, check-in capacity and cancelled-event guard')
c.close();Path(path).unlink()
