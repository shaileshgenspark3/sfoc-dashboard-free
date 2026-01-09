# Implementation Plan: Social Sharing Module

## Phase 1: Shared Components & Utilities
- [ ] Task: Create `ShareButton` component
    - [ ] Task: Create a new component `frontend/src/components/ShareButton.tsx` styled with the 'btn-safety' class.
    - [ ] Task: Implement the `handleShare` logic using `navigator.share` API.
    - [ ] Task: Implement "Copy to Clipboard" fallback using `navigator.clipboard.writeText`.
    - [ ] Task: Add `react-hot-toast` notifications for success/failure feedback ("PAYLOAD TRANSMITTED" / "TRANSMISSION ERROR").
- [ ] Task: Create `shareUtils.ts`
    - [ ] Task: Create `frontend/src/utils/shareUtils.ts` to format sharing strings.
    - [ ] Task: Implement functions to generate text for:
        - `getAchievementShareText(participant: Participant)`
        - `getImpactShareText(stats: Stats)`
        - `getGroupShareText(group: Group)`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Shared Components & Utilities' (Protocol in workflow.md)

## Phase 2: Feature Integration
- [ ] Task: Integrate Sharing into `MyPerformance`
    - [ ] Task: Add `ShareButton` to the "Header" section in `MyPerformance.tsx`.
    - [ ] Task: Connect it to `getAchievementShareText` to share personal stats.
- [ ] Task: Integrate Sharing into `Dashboard`
    - [ ] Task: Add `ShareButton` near the "Impact Meter" in `Dashboard.tsx`.
    - [ ] Task: Connect it to `getImpactShareText` to share global charity progress.
- [ ] Task: Integrate Sharing into `Leaderboard`
    - [ ] Task: Add `ShareButton` for the "Top 3" ranks to allow them to brag about their position.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Feature Integration' (Protocol in workflow.md)

## Phase 3: Validation & Polish
- [ ] Task: Mobile Testing
    - [ ] Task: Verify native share sheet triggers on Android/iOS via Chrome DevTools device mode.
- [ ] Task: UI Refinement
    - [ ] Task: Ensure the button animations match the "Industrial" hover effects (e.g., border color shift to `#FF6B35`).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Validation & Polish' (Protocol in workflow.md)
