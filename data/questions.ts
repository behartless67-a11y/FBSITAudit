import { Area } from '@/types/audit';

export const areas: Area[] = [
  {
    id: 'desktop-client-user',
    name: 'Desktop/Client/User',
    questions: [
      {
        id: 1,
        section: 'Personnel Management',
        text: 'Have all Faculty/Staff hired in the past month, or who had a problem last month, been granted correct permissions in the appropriate Batten shared resources?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 2,
        text: 'Have all Faculty/Staff hired in the past month, or who had a problem last month, been placed in the appropriate communications lists?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 3,
        text: 'Have all Faculty/Staff hired in the past month, or who had a problem last month, been provided the appropriate hardware and properly trained on its usage?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 4,
        text: 'Have all Faculty/Staff who have left in the past month, or who had a problem last month, had correct permissions revoked from all Batten shared resources?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 5,
        text: 'Have all Faculty/Staff who have left in the past month, or who had a problem last month, been removed from all communications lists and replaced by someone to sustain the process?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 6,
        text: 'Have all Faculty/Staff who have left in the past month, or who had a problem last month, turned in their assigned hardware and had it accounted for?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 7,
        section: 'Hardware/Inventory',
        text: 'Have all hardware items purchased in the past month been properly accounted and/or inventory as required?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 8,
        text: 'Is all Batten hardware being properly managed based on Batten best practices?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 9,
        section: 'Software',
        text: 'Are all Batten software titles being properly managed and accounted for based on Batten best practices?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 10,
        text: 'Have all new hires been added or removed from the onboarding Canvas site?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'No']
      }
    ]
  },
  {
    id: 'data-analytics',
    name: 'Data and Analytics',
    questions: [
      {
        id: 1,
        section: 'Access Controls',
        text: 'Have permissions on all datasets (Fabric, SQL, Dataverse, PowerBI, Salesforce) been reviewed to ensure only authorized users have access?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 2,
        section: 'Backup & Recovery',
        text: 'Have all backups run successfully and are Fabric Workspaces synced to DevOps repos?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 3,
        section: 'Data Retention',
        text: 'Has data been archived or purged per UVA/VITA policy?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 4,
        section: 'Data Quality',
        text: 'Has data accuracy, completeness, and consistency been validated across all systems?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 5,
        section: 'Documentation',
        text: 'Are all systems and processes documented and current?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 6,
        section: 'Security & Monitoring',
        text: 'Are access logs and audit trails being retained and reviewed?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      }
    ]
  },
  {
    id: 'school-systems',
    name: 'School Systems',
    questions: [
      {
        id: 1,
        section: 'User Access Review',
        text: 'Has a review of all Faculty and Staff users been reviewed for appropriate permissions within Slate?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 2,
        text: 'Have all accounts been deactivated for departing Faculty/Staff at Batten using the Batten IT guidelines and best practices?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 3,
        text: 'Have all new accounts been created for new Faculty/Staff at Batten using the Batten IT guidelines and best practices?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 4,
        text: 'Have all Slate user role assignments been verified to align with current job responsibilities and the principle of least privilege?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 5,
        text: 'Have any shared or generic Slate accounts been identified and reviewed for necessity and appropriate access controls?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 6,
        section: 'Account Reconciliation',
        text: 'Has a reconciliation been completed between active Slate users and the current HR roster to identify orphaned or unused accounts?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 7,
        section: 'Integration & Service Accounts',
        text: 'Have all Slate integration accounts (service accounts, API connections) been reviewed for security and appropriate credential management?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 8,
        section: 'Documentation',
        text: 'Has documentation been reviewed and updated for Slate access request and approval workflows?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 9,
        section: 'Elevated Privileges',
        text: 'Have all users with elevated privileges (admin roles, query access, application management) in Slate been reviewed and certified as appropriate?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      },
      {
        id: 10,
        section: 'Audit & Monitoring',
        text: 'Has audit logging been reviewed in Slate for any unusual access patterns, data exports, or unauthorized configuration changes?',
        type: 'single-choice',
        required: true,
        options: ['Yes', 'Still working on an issue']
      }
    ]
  }
];
