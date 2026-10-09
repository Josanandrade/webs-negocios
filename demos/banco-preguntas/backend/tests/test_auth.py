def test_register_login_and_me(client):
    r = client.post("/api/auth/register", json={"email": "Ana@Example.com", "password": "clave-larga-1"})
    assert r.status_code == 201
    r = client.post("/api/auth/login", json={"email": "ana@example.com", "password": "clave-larga-1"})
    assert r.status_code == 200
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "ana@example.com"


def test_duplicate_email_rejected(client, alice):
    r = client.post("/api/auth/register", json={"email": "alice@example.com", "password": "otra-clave-9"})
    assert r.status_code == 409


def test_wrong_password_and_unknown_user(client, alice):
    assert client.post("/api/auth/login", json={"email": "alice@example.com", "password": "mala-clave"}).status_code == 401
    assert client.post("/api/auth/login", json={"email": "nadie@example.com", "password": "mala-clave"}).status_code == 401


def test_endpoints_require_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/documents").status_code == 401
    assert client.get("/api/documents", headers={"Authorization": "Bearer basura"}).status_code == 401


def test_short_password_rejected(client):
    r = client.post("/api/auth/register", json={"email": "x@example.com", "password": "corta"})
    assert r.status_code == 422
