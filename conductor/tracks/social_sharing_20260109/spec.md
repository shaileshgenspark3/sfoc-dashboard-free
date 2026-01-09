# Specification: Social Sharing Module

## 1. Overview
This track implements a social sharing module that allows users to seamlessly share their achievements (PROTOCOL_ACHIEVEMENT) and charity impact (IMPACT_METER) from the dashboard to WhatsApp and other social platforms. The sharing mechanism will generate a visually consistent, "Industrial Utilitarian" themed summary image or text payload that aligns with the project's design philosophy.

## 2. Goals
- Enable one-click sharing of "PROTOCOL_ACHIEVEMENT" (personal milestones).
- Enable one-click sharing of "IMPACT_METER" (collective charity contribution).
- Ensure shared content matches the "Industrial Cyberpunk" aesthetic.
- Increase public visibility of the FIT-O-CHARITY event.

## 3. User Stories
- As a **Participant**, I want to share my daily activity streak on WhatsApp so that I can show off my consistency.
- As a **Group Leader**, I want to share my squad's ranking on social media to recruit more members.
- As a **Supporter**, I want to share the total charity fund raised to encourage more donations.

## 4. Functional Requirements
### 4.1 Frontend
- **Share Button Component:** A reusable `ShareButton` component styled with `btn-safety` aesthetics.
- **Payload Generator:** A utility to construct the share message strings, including emojis and dynamic data (e.g., "🚀 MISSION STATUS: COMPLETED | 5KM RUN | IMPACT: ₹50").
- **Web Share API Integration:** Use `navigator.share` for mobile devices to trigger native sharing sheets.
- **Fallback:** A "Copy to Clipboard" fallback for desktop browsers that don't support the Web Share API.

### 4.2 Backend
- No backend changes required for the MVP sharing text functionality.
- *(Future Scope)*: Server-side image generation for rich media sharing.

## 5. Non-Functional Requirements
- **Performance:** Sharing action must be instantaneous (<100ms response).
- **Compatibility:** Must support modern mobile browsers (Chrome Android, Safari iOS).
- **Privacy:** Do not share PII (email/phone) in the public payload. Only share First Name and aggregated stats.

## 6. UI/UX Design
- **Iconography:** Use `Share2` or `Upload` icon from `lucide-react`.
- **Feedback:** Trigger a "Confetti" burst and a toast notification ("UPLINK ESTABLISHED: PAYLOAD TRANSMITTED") upon successful share.
