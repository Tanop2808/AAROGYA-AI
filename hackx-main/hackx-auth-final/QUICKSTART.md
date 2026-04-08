# Quick Start Guide - Authentication Testing

## 🚀 Setup Steps

### Step 1: Create `.env.local`
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit it with your values:
MONGODB_URI=mongodb://localhost:27017/sehat-setu
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
```

### Step 2: Start MongoDB
```bash
# If using local MongoDB
mongod

# OR if using MongoDB Atlas, update MONGODB_URI with your connection string
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Development Server
```bash
npm run dev
# App will be at http://localhost:3000
```

---

## 🧪 Test Scenarios

### Test 1: Register New Patient
1. Navigate to `http://localhost:3000`
2. Click "नमस्ते अपना नंबर दर्ज करें" (Patient Login)
3. Enter phone: `9876500001`
4. Enter password: `test@123`
5. Click "✨ नया खाता बनाएं" (Create New Account)
6. Fill in:
   - Name: `Test Patient`
   - Age: `25`
   - Gender: `Female`
   - Village: `Test Village`
   - Conditions: `Diabetes, BP` (optional)
   - Blood Group: `O+` (optional)
7. Click "✓ खाता बनाएं"
8. ✅ Redirected to home page with YOUR data

### Test 2: Login Existing Patient
1. Go to `/login`
2. Enter phone: `9876500001`
3. Enter password: `test@123`
4. Click "▶ जारी रखें"
5. ✅ Logged in, redirected to `/home`

### Test 3: Verify Real Data Display
1. On `/home`, verify:
   - Name is YOUR name (not "Ramkali Devi")
   - Village is YOUR village
   - Age and blood group are YOUR values
2. Click "मेरे स्वास्थ्य रिकॉर्ड" (My Health Records)
3. Verify `/records` page shows:
   - Profile card with YOUR name
   - YOUR details (gender, age, village, blood group)

### Test 4: Authentication Protected Routes
1. Open browser DevTools (F12)
2. Go to `Application` → `Local Storage`
3. Delete the `authToken` entry
4. Refresh the page or navigate to `/records`
5. ✅ Auto-redirect to `/login`

### Test 5: Logout
1. On `/home` page, click "🚪 लॉग आउट"
2. Should be redirected to `/login`
3. Verify `authToken` is cleared from localStorage

---

## 🔍 MongoDB Verification

### Check if Patient was Created:
```javascript
// In MongoDB shell or Atlas
use sehat-setu
db.patients.findOne({ phone: "9876500001" })

// Should return something like:
{
  _id: ObjectId(...),
  phone: "9876500001",
  name: "Test Patient",
  age: 25,
  gender: "female",
  village: "Test Village",
  password: "$2a$10$...", // hashed, never the plain text!
  role: "patient",
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

### Check if Password is Hashed:
The `password` field should look like: `$2a$10$...` (bcrypt hash)
- ✅ GOOD: Hashed with bcryptjs
- ❌ BAD: Plain text password visible (security issue!)

---

## 🐛 Common Issues & Solutions

### Issue: "MONGODB_URI is not defined"
**Solution**: 
- Make sure `.env.local` exists in project root
- Add `MONGODB_URI=mongodb://localhost:27017/sehat-setu`
- Restart dev server

### Issue: "Can't connect to MongoDB"
**Solution**:
- Verify MongoDB is running: `mongosh` or `mongo`
- Check connection string in `.env.local`
- Try MongoDB Atlas instead: `mongodb+srv://user:pass@cluster.mongodb.net/sehat-setu`

### Issue: Token not saving
**Solution**:
- Check browser localStorage is not blocked
- Check API response includes `token` field
- Check Network tab in DevTools for 201 response

### Issue: Infinite redirect loop
**Solution**:
- Clear localStorage: `localStorage.clear()` in console
- Check JWT_SECRET is same as in `.env.local`
- Check `authToken` is being saved

### Issue: Password always fails
**Solution**:
- Passwords are case-sensitive
- Check for leading/trailing spaces
- Verify password matches what you entered during registration

---

## 📱 Testing Different Users

### User 1:
```
Phone: 9876500001
Password: test123@
Name: Ahmad Khan
Age: 30
Village: Village A
```

### User 2:
```
Phone: 9876500002
Password: secure456!
Name: Priya Singh
Age: 28
Village: Village B
```

### User 3:
```
Phone: 9876500003
Password: mypass789#
Name: Raj Patel
Age: 35
Village: Village C
```

---

## 📊 API Testing with cURL

### Test Registration:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876500001",
    "password": "test@123",
    "isRegister": true,
    "name": "Test User",
    "age": "25",
    "gender": "female",
    "village": "Test Village"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876500001",
    "password": "test@123",
    "isRegister": false
  }'
```

### Test Get User (replace TOKEN with actual token):
```bash
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Verification Checklist

After setup, verify all these work:

- [ ] Register new patient via `/login`
- [ ] Patient data saved to MongoDB with hashed password
- [ ] Login with correct credentials works
- [ ] Login with wrong password fails
- [ ] `/home` shows YOUR data, not "Ramkali Devi"
- [ ] `/records` shows YOUR patient info
- [ ] Logout clears token and redirects to `/login`
- [ ] Accessing `/records` without token redirects to `/login`
- [ ] Token persists on page refresh until logout
- [ ] Different patients see different data
- [ ] Password is hashed in database (not plain text)

---

## 🎯 Next Steps

Once everything is working:

1. **Doctor Authentication** (same pattern as patient)
   - Update Doctor model with password
   - Create `/api/auth/doctor/login`
   - Update `/doctor/login` page

2. **ASHA Worker Authentication**
   - Update ASHA model with password
   - Create `/api/auth/asha/login`
   - Update `/asha/dashboard` page

3. **Consultations & Records**
   - Create Consultation model
   - Link consultations to authenticated doctor & patient
   - Replace hardcoded consultation data with DB queries

---

**Need Help?** Check:
1. Browser console for JavaScript errors
2. Network tab for API errors (check response status)
3. MongoDB logs for connection issues
4. `.env.local` for missing variables

Good luck! 🚀
