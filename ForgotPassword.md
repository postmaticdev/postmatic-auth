## Account Auth - Forgot Password

Dokumentasi ini menjelaskan 3 endpoint forgot password pada module `account/auth`.

Base route:

- `/api/account/auth`

### 1) Request Forgot Password

- **Method**: `POST`
- **Path**: `/forgot-password`
- **Body**:

```json
{
  "email": "user@example.com"
}
```

Behaviour:

- Validasi email wajib dan format email valid.
- Cek limiter (retry-after) khusus forgot password.
- Generate token forgot password.
- Enqueue email reset password (via queue mailer).
- Link email mengarah ke:
  - `{AUTH_URL}/forgot-password/{token}`

Success response:

```json
{
  "email": "user@example.com",
  "retryAfter": 60
}
```

Error utama:

- `PLEASE_WAIT` (masih kena limiter, cek `retryAfter`)
- `USER_NOT_FOUND`

---

### 2) Check Forgot Password Token Status

- **Method**: `GET`
- **Path**: `/forgot-password/{forgotPasswordToken}`

Behaviour:

- Validasi token forgot password.
- Return status validitas token.
- Return info akun agar UI lebih informatif.

Success response:

```json
{
  "valid": true,
  "id": "uuid-profile",
  "name": "User Name",
  "email": "user@example.com",
  "imageUrl": null,
  "hasCredentialLogin": true
}
```

Error utama:

- `INVALID_FORGOT_PASSWORD_TOKEN`
- `USER_NOT_FOUND`

---

### 3) Submit New Password

- **Method**: `POST`
- **Path**: `/forgot-password/{forgotPasswordToken}`
- **Body**:

```json
{
  "newPassword": "new-secure-password"
}
```

Behaviour:

- Validasi token forgot password.
- Validasi `newPassword` wajib, minimal 6 karakter.
- Update password user credential.

Success response:

```json
{
  "valid": true,
  "id": "uuid-profile",
  "name": "User Name",
  "email": "user@example.com",
  "imageUrl": null
}
```

Error utama:

- `INVALID_FORGOT_PASSWORD_TOKEN`
- `USER_NOT_FOUND`
