import React from 'react';

export default function MedicalReport() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white max-w-3xl w-full p-10 sm:p-14 shadow-md ring-1 ring-gray-900/5 antialiased font-sans">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            {/* Logo Heart Icon */}
            <div className="text-gray-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-handshake">
                 <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
               </svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-wide text-emerald-700">Evergreen Wellness Hospital</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">123 Harmony Street, Sunnyville, CA 90210, USA</p>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-bold tracking-[0.15em] text-gray-900">MEDICAL REPORT</h2>
        </div>

        {/* Visit Info */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 tracking-wide">Visit Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-800">
            <div className="flex">
              <span className="font-bold w-36">Doctor&apos;s Name:</span>
              <span>Dr. Olivia Greene</span>
            </div>
            <div className="flex">
              <span className="font-bold w-28 sm:w-24">Visit Date:</span>
              <span>11.11.2023</span>
            </div>
            <div className="flex">
              <span className="font-bold w-36">Specialisation:</span>
              <span>Cardiology</span>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 tracking-wide">Patient Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-800">
            <div className="flex">
              <span className="font-bold w-36">Full Name:</span>
              <span>Sarah Anderson</span>
            </div>
            <div className="flex">
              <span className="font-bold w-28 sm:w-24">Birth Date:</span>
              <span>03.05.1989</span>
            </div>
            <div className="flex">
              <span className="font-bold w-36">Med. Number:</span>
              <span>594302832</span>
            </div>
            <div className="flex">
              <span className="font-bold w-28 sm:w-24">ID:</span>
              <span>3333-3669-9654-7788</span>
            </div>
            <div className="flex">
              <span className="font-bold w-36">Phone:</span>
              <span>+1 (555) 789-0123</span>
            </div>
            <div className="flex">
              <span className="font-bold w-28 sm:w-24">Email:</span>
              <span>s.anderson@mail.com</span>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-emerald-700 mb-3 tracking-wide">Assessment</h3>
          <p className="text-sm leading-relaxed text-gray-800">
            Mrs. Anderson appears in good health with no immediate concerns during the examination.
            Based on the assessment, there are no significant issues detected, and vital signs are within normal ranges.
          </p>
        </div>

        {/* Diagnosis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-emerald-700 mb-3 tracking-wide">Diagnosis</h3>
          <p className="text-sm leading-relaxed text-gray-800">
            After thorough examination, no specific medical conditions or acute illnesses were identified.
            The diagnosis indicates a healthy status with no evidence of underlying health issues.
          </p>
        </div>

        {/* Prescription */}
        <div className="mb-20">
          <h3 className="text-lg font-semibold text-emerald-700 mb-3 tracking-wide">Prescription</h3>
          <p className="text-sm leading-relaxed text-gray-800">
            No prescription is necessary at this time, as the patient is in good health with no identified
            medical concerns. Given the absence of any medical issues, no medication is prescribed at present.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-xs text-gray-400 font-light mt-12 pt-10 border-t border-gray-100/60 leading-relaxed">
          <p>For inquiries and appointments, feel free to contact us.</p>
          <p>phone: +1 (555) 123-4567, email: info@evergreenwellnesshospital.com</p>
          <p>www.EvergreenWellnessHospital.com</p>
        </div>
      </div>
    </div>
  );
}
