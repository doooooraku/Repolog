# Google Play Data Safety Declaration

## Overview
Repolog is a local-first app. No user accounts. No cloud backend. No data collection.

## Data Safety Questionnaire Answers

### Does your app collect or share any of the required user data types?
**Yes** — the app shares purchase history with RevenueCat (payment processor) and device IDs with Google AdMob (ad network, Free plan only, with UMP consent). See "Data Types Breakdown" below for details.

### Is all of the user data collected by your app encrypted in transit?
**Yes** — all network communication uses HTTPS (RevenueCat, AdMob).

### Do you provide a way for users to request that their data be deleted?
**Not applicable** — no user data is collected or stored on any server.
All data is stored locally on the user's device and can be deleted by uninstalling the app.

---

## Data Types Breakdown

### Location
- **Collected?** Optional (only when user enables "Include location")
- **Shared?** No — stored only on-device in the report
- **Purpose:** App functionality (adding location metadata to reports)
- **Encrypted in transit?** N/A (never transmitted)
- **Required or optional?** Optional

### Photos
- **Collected?** Yes (camera/library photos added by user)
- **Shared?** No — stored only on-device
- **Purpose:** App functionality (photo reports)
- **Encrypted in transit?** N/A (never transmitted)
- **Required or optional?** Required for core functionality

### Purchase history
- **Collected?** Yes (RevenueCat manages subscription state)
- **Shared?** Yes — with RevenueCat (payment processor)
- **Purpose:** Subscription management
- **Encrypted in transit?** Yes (HTTPS)
- **Required or optional?** Optional (Pro features)

### Device or other IDs
- **Collected?** Only by AdMob (Free plan, with UMP consent)
- **Shared?** Yes — with Google AdMob (ad network)
- **Purpose:** Advertising
- **Encrypted in transit?** Yes (HTTPS)
- **Required or optional?** Optional (Free plan only, with consent)

---

## Summary Table for Play Console

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Location | Optional | No | App functionality |
| Photos & videos | Yes | No | App functionality |
| Purchase history | Yes | Yes (RevenueCat) | Subscription mgmt |
| Device IDs | Yes (Free only) | Yes (AdMob) | Advertising |

## Deletion Policy
Users can delete all data by:
1. Deleting individual reports within the app
2. Uninstalling the app (removes all local data)
3. No server-side data exists to delete
