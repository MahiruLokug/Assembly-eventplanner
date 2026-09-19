"""End-to-end smoke check against an isolated local Assembly preview."""
import urllib.request
import urllib.error
import json
import uuid

BASE='http://127.0.0.1:3000'
def call(path,data=None,method=None,origin=None):
    headers={'Content-Type':'application/json'}
    if origin: headers['Origin']=origin
    request=urllib.request.Request(BASE+path,json.dumps(data).encode() if data is not None else None,headers,method=method)
    try:
        response=urllib.request.urlopen(request,timeout=30)
        return response.status,json.load(response)
    except urllib.error.HTTPError as error:
        raw=error.read().decode()
        try: payload=json.loads(raw)
        except json.JSONDecodeError: payload={'error':raw}
        return error.code,payload

status,data=call('/api/events')
assert status==200,(status,data)
assert len(data['events'])>=6
email='qa-'+str(uuid.uuid4())+'@example.com'
form={'eventId':'debate-final','name':'QA Visitor','email':email,'role':'Student'}
status,ticket=call('/api/registrations',form)
assert status==201,(status,ticket)
status,data=call('/api/registrations',form)
assert status==409,(status,data)
credentials={'id':ticket['id'],'email':email}
status,data=call('/api/tickets',credentials)
assert status==200 and data['status']=='confirmed',(status,data)
status,data=call('/api/tickets',{'id':ticket['id'],'email':'wrong@example.com'})
assert status==404
status,data=call('/api/tickets',credentials,'DELETE')
assert status==200,(status,data)
status,data=call('/api/tickets',credentials)
assert data['status']=='cancelled'
status,data=call('/api/organiser',{'action':'cancel','id':'debate-final'})
assert status==403,(status,data)
status,data=call('/api/registrations',form,origin='https://untrusted.example')
assert status==403
print('PASS: event API, registration, duplicate rejection, private lookup, cancellation, organiser gate, cross-origin rejection')
