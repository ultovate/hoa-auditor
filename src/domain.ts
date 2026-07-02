/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FINDING_IDS = ['total-exposure', 'insurance', 'savings', 'reserve-study'] as const;
export type FindingId = (typeof FINDING_IDS)[number];

export const TABS = ['Summary', 'Financial', 'Risks', 'Restrictions', 'Timeline', 'Compliance', 'Documents'] as const;
export type Tab = (typeof TABS)[number];

export const CURRENT_USER_EMAIL = 'lay.clough@gmail.com';
