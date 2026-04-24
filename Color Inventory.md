# **HOA Auditor — Gemini Design Color Inventory**

This inventory maps the hex codes used in the high-fidelity wireframe to their specific UI roles.

### **Primary Colors**

| Token                     | Hex      | Role                                                                        |
| :------------------------ | :------- | :-------------------------------------------------------------------------- |
| **Brand accent**    | \#9333EA | Logo, Floating Action Button, active tab indicators, "View all →" links    |
| **Dark chrome**     | \#1F1224 | Top Navigation Header, checklist header background, primary structural text |
| **Page background** | \#F8F9FB | Main body background, sub-card backgrounds                                  |

### **Secondary Colors**

| Token                           | Hex      | Role                                                                       |
| :------------------------------ | :------- | :------------------------------------------------------------------------- |
| **Warm surface**          | \#94A3B8 | Sidebar/Checklist subtext, metadata labels in the dark header              |
| **Card bg**               | \#FFFFFF | All primary content cards, inactive tab backgrounds                        |
| **Banner dark strip**     | \#2D1B33 | Property hero banner background (Property Address & Score section)         |
| **Source / accent muted** | \#64748B | Source citations (e.g., "Source: ReserveStudy.pdf"), non-critical metadata |
| **Muted foreground**      | \#64748B | Eyebrow labels, secondary body text, inactive tab text                     |

### **Semantic Colors**

#### **Danger (HIGH / Verification Needed)**

| Token                     | Hex      | Rule                                                   |
| :------------------------ | :------- | :----------------------------------------------------- |
| **Border/Stroke**   | \#EF4444 | Card border-left indicators, priority badges           |
| **Text**            | \#B91C1C | Alert text on white backgrounds, high-risk status text |
| **Card Background** | \#FEF2F2 | Tinted background for high-priority risk cards         |
| **Pill Background** | \#FEE2E2 | Background for "Action Needed" or "Restricted" badges  |

#### **Warning (MEDIUM / Limits)**

| Token | Hex | Rule |
| :---- | :-- | :--- |

#### **Success (VERIFIED / GREEN)**

| Token                     | Hex      | Rule                                              |
| :------------------------ | :------- | :------------------------------------------------ |
| **Text**            | \#10B981 | WUCIOA score, verified counts, status checkmarks  |
| **Border**          | \#10B981 | Success card border-left, verified status strokes |
| **Pill Background** | \#D1FAE5 | "Verified" or "OK" badge backgrounds              |
| **Card Background** | \#F0FDF4 | Background for successfully verified sections     |

#### **Neutral (LOW / Standard)**

| Token                    | Hex      | Role                                                        |
| :----------------------- | :------- | :---------------------------------------------------------- |
| **LOW / Standard** | \#64748B | Standard rule badges, inactive checkboxes, secondary status |
| **Surface/Track**  | \#E2E8F0 | Progress bar tracks, card borders, horizontal separators    |
| **Pill Text**      | \#475569 | Text on standard/neutral badges                             |

### **Blue (2026 Compliance — Reserved)**

| Token                    | Hex      | Role                                          |
| :----------------------- | :------- | :-------------------------------------------- |
| **Background**     | \#DBEAFE | 2026 Compliance badge background              |
| **Primary/Action** | \#2563EB | 2026 badge text and specific compliance links |
| **Accent**         | \#1D4ED8 | Gradient accents for future features          |
