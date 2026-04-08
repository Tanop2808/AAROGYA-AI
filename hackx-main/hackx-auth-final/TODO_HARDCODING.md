# Remaining Hardcoding Issues & TODO

## ✅ FIXED Pages

| Page | Status | What Was Fixed |
|------|--------|----------------|
| `/login` | ✅ FIXED | Now uses real authentication with password |
| `/records` | ✅ FIXED | Shows actual patient data, not "Ramkali Devi" |
| `/home` | ✅ FIXED | Displays real user data using useAuth hook |

---

## ⚠️ STILL NEEDS WORK - Hardcoded Data

### 1. **`/symptoms` page**
- **Hardcoding**: `localStorage.getItem("selectedSymptoms")`
- **TODO**: Create Consultation model to save symptoms to database
- **Impact**: Symptoms not persisted - lost on page refresh

### 2. **`/triage` page**
- **Hardcoding**: Hardcoded medicines and triage logic
- **TODO**: Connect to real medicine database
- **Impact**: Fake triaging, not real medical data

### 3. **`/medicine` page**
- **Hardcoding**: Dummy pharmacy data
- **TODO**: Integrate pharmacy API/database
- **Impact**: Not showing real nearby pharmacies

### 4. **`/asha/dashboard` page**
- **Hardcoding**: `localStorage.getItem("ashaPhone") || "9876500001"`
- **TODO**: Implement ASHA worker authentication (similar to patient auth)
- **Also**: Hardcoded patient list

### 5. **`/doctor/dashboard` page**
- **Hardcoding**: Hardcoded consultations list
- **TODO**: Implement doctor authentication + fetch actual consultations
- **Also**: Hardcoded patient data

### 6. **`/pharmacist/dashboard` page**
- **Hardcoding**: Using localStorage for pharmacist data
- **TODO**: Implement pharmacist authentication + real inventory

---

## 🎯 Implementation Priority

### Phase 1 (Critical - Done)
- ✅ Patient login with password
- ✅ Session management with JWT
- ✅ Protected pages redirect to login

### Phase 2 (High Priority - TODO)
1. **Doctor Authentication**
   ```typescript
   // Add to models/index.ts
   export interface IDoctor {
     phone: string;
     name: string;
     specialization: string;
     password: string;
     role: "doctor";
   }
   ```

2. **ASHA Worker Authentication**
   ```typescript
   // Existing in models/index.ts but needs password
   export interface IASHAWorker {
     phone: string;
     name: string;
     password: string; // ADD THIS
     villages: string[];
     role: "ashaworker";
   }
   ```

3. **Consultation Model** (Link to patient & doctor)
   ```typescript
   export interface IConsultation {
     patientPhone: string;
     doctorPhone: string;
     symptoms: string[];
     diagnosis: string;
     prescription: string;
     status: "pending" | "completed";
     createdAt: Date;
   }
   ```

### Phase 3 (Medium Priority - TODO)
- Store triage results in database
- Link medicines to pharmacies
- Real pharmacy inventory system

### Phase 4 (Enhancement - TODO)
- Offline sync mechanism
- Data conflict resolution
- Analytics & reporting

---

## 🔄 Quick Fix Checklist

- [ ] Update Doctor model - add password field
- [ ] Update ASHA model - add password field
- [ ] Create Doctor login API (`/api/auth/doctor/login`)
- [ ] Create ASHA login API (`/api/auth/asha/login`)
- [ ] Update `/doctor/login` page to use auth
- [ ] Update `/asha/dashboard` to use auth
- [ ] Create Consultation model
- [ ] Add consultations API (`/api/consultations`)
- [ ] Connect `/records` to real consultations from DB
- [ ] Remove hardcoded in `/doctor/dashboard`
- [ ] Remove hardcoded in `/pharmacist/dashboard`
- [ ] Remove hardcoded in `/medicine` page

---

## 🛠️ Quick Start Template

### Doctor Authentication (copy from Patient pattern):
```typescript
// 1. Update models/Doctor.ts - add password
password: { type: String, required: true }

// 2. Create /api/auth/doctor/login/route.ts (copy from /api/auth/login/route.ts)
// 3. Create useAuthDoctor hook (copy from useAuth.ts)
// 4. Update /doctor/login page to use new hook
```

### Example for Doctor:
```typescript
// In /app/doctor/login/page.tsx
const { login } = useAuthDoctor();
const result = await login(phone, password);
if (result.success) {
  router.push("/doctor/dashboard");
}
```

---

## 📊 Current Data Flow Analysis

```
❌ BROKEN (Hardcoded/localStorage)
├─ /medicine → dummy pharmacies
├─ /symptoms → stores in localStorage only
├─ /triage → hardcoded AI response
├─ /doctor/dashboard → hardcoded cases
├─ /asha/dashboard → hardcoded patients
└─ /pharmacist/dashboard → dummy inventory

✅ FIXED (Database + Auth)
├─ /login → validates against DB + password
├─ /home → real user data from DB
└─ /records → real patient info from DB
```

---

## 🔑 Key Files to Update Next

1. `models/Doctor.ts` - Add password
2. `models/index.ts` - Add Consultation model
3. `app/api/auth/doctor/login/route.ts` - Create (copy pattern)
4. `lib/useAuthDoctor.ts` - Create (copy pattern)
5. `app/doctor/login/page.tsx` - Update to use auth
6. `app/api/consultations/route.ts` - Create

---

**Status**: Phase 1 Complete ✅, Ready for Phase 2 🚀
