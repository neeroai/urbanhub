# Bird.com Contacts API

## Overview

The Bird.com Contacts API provides comprehensive customer contact management capabilities, allowing you to create, update, and organize patient contact information for the DRAD medical practice management system. This API serves as the foundation for building a centralized patient database with enhanced CRM functionality.

## Core Capabilities

### Contact Management Features

- **Create and update contact records**
- **Search contacts by multiple identifiers**
- **Manage custom attribute schemas**
- **Organize contacts into lists**
- **Track contact events and interactions**
- **Phone number validation and formatting**

## Contact Data Model

### Basic Contact Structure

```typescript
interface Contact {
  id: string;
  identifiers: ContactIdentifier[];
  attributes: ContactAttributes;
  lists: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContactIdentifier {
  key: string;
  value: string;
  type: 'email' | 'phone' | 'external_id';
}

interface ContactAttributes {
  // Standard attributes
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  
  // Custom attributes
  [key: string]: any;
}
```

### Medical Practice Contact Model

```typescript
interface MedicalContact extends Contact {
  attributes: MedicalContactAttributes;
}

interface MedicalContactAttributes {
  // Personal Information
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  
  // Medical Information
  medicalRecordNumber?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  
  // Appointment Information
  preferredAppointmentTime?: string;
  preferredCommunicationChannel?: 'whatsapp' | 'sms' | 'email' | 'voice';
  lastAppointmentDate?: string;
  nextAppointmentDate?: string;
  
  // Surgery Information
  surgeryType?: string;
  surgeryDate?: string;
  surgeryStatus?: 'scheduled' | 'completed' | 'cancelled';
  surgeonNotes?: string;
  
  // Financial Information
  insuranceProvider?: string;
  policyNumber?: string;
  financialStatus?: 'current' | 'overdue' | 'paid';
  lastPaymentDate?: string;
  
  // Communication Preferences
  appointmentReminders?: boolean;
  marketingMessages?: boolean;
  postOperativeFollowUp?: boolean;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Custom Fields
  referralSource?: string;
  consultationDate?: string;
  consultationNotes?: string;
  followUpRequired?: boolean;
}
```

## Contact Operations

### Creating Contacts

```typescript
// Create a new medical contact
async function createMedicalContact(
  contactData: Partial<MedicalContactAttributes>
): Promise<MedicalContact> {
  const contact = {
    identifiers: [
      {
        key: 'phone',
        value: contactData.phone!,
        type: 'phone' as const
      }
    ],
    attributes: {
      ...contactData,
      createdAt: new Date().toISOString()
    }
  };

  if (contactData.email) {
    contact.identifiers.push({
      key: 'email',
      value: contactData.email,
      type: 'email' as const
    });
  }

  const response = await birdApiClient.post('/contacts', contact);
  return response.data;
}

// Example usage
const newPatient = await createMedicalContact({
  firstName: 'María',
  lastName: 'González',
  phone: '+573001234567',
  email: 'maria.gonzalez@email.com',
  dateOfBirth: '1985-03-15',
  gender: 'female',
  surgeryType: 'Abdominoplastia',
  consultationDate: '2024-01-15',
  referralSource: 'Instagram',
  appointmentReminders: true,
  marketingMessages: true
});
```

### Updating Contacts

```typescript
// Update contact information
async function updateMedicalContact(
  contactId: string,
  updates: Partial<MedicalContactAttributes>
): Promise<MedicalContact> {
  const updatePayload = {
    attributes: {
      ...updates,
      updatedAt: new Date().toISOString()
    }
  };

  const response = await birdApiClient.put(`/contacts/${contactId}`, updatePayload);
  return response.data;
}

// Update patient after surgery
const updatedPatient = await updateMedicalContact(patientId, {
  surgeryDate: '2024-02-01',
  surgeryStatus: 'completed',
  surgeonNotes: 'Surgery completed successfully. Recovery proceeding as expected.',
  nextAppointmentDate: '2024-02-08',
  followUpRequired: true
});
```

### Searching Contacts

```typescript
// Search contacts by phone number
async function findContactByPhone(phoneNumber: string): Promise<MedicalContact | null> {
  const response = await birdApiClient.get(`/contacts`, {
    params: {
      identifier: phoneNumber
    }
  });

  return response.data.results.length > 0 ? response.data.results[0] : null;
}

// Search contacts by email
async function findContactByEmail(email: string): Promise<MedicalContact | null> {
  const response = await birdApiClient.get(`/contacts`, {
    params: {
      identifier: email
    }
  });

  return response.data.results.length > 0 ? response.data.results[0] : null;
}

// Advanced search with filters
async function searchMedicalContacts(
  filters: ContactSearchFilters
): Promise<MedicalContact[]> {
  const response = await birdApiClient.get('/contacts', {
    params: {
      ...filters,
      limit: 100
    }
  });

  return response.data.results;
}

interface ContactSearchFilters {
  surgeryType?: string;
  surgeryStatus?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  referralSource?: string;
  followUpRequired?: boolean;
}
```

## Custom Attribute Schemas

### Defining Medical Attributes

```typescript
// Define custom attribute schema for medical practice
async function createMedicalAttributeSchema(): Promise<void> {
  const medicalSchema = {
    attributes: [
      {
        name: 'medicalRecordNumber',
        type: 'string',
        required: false,
        description: 'Patient medical record number'
      },
      {
        name: 'surgeryType',
        type: 'string',
        required: false,
        description: 'Type of surgery or procedure'
      },
      {
        name: 'surgeryDate',
        type: 'date',
        required: false,
        description: 'Date of surgery'
      },
      {
        name: 'surgeryStatus',
        type: 'enum',
        required: false,
        options: ['scheduled', 'completed', 'cancelled'],
        description: 'Current surgery status'
      },
      {
        name: 'referralSource',
        type: 'string',
        required: false,
        description: 'How the patient found the practice'
      },
      {
        name: 'consultationDate',
        type: 'date',
        required: false,
        description: 'Initial consultation date'
      },
      {
        name: 'followUpRequired',
        type: 'boolean',
        required: false,
        description: 'Whether patient requires follow-up'
      }
    ]
  };

  await birdApiClient.post('/contacts/attributes', medicalSchema);
}
```

## Contact Lists Management

### Creating Contact Lists

```typescript
// Create contact lists for different patient categories
async function createPatientLists(): Promise<void> {
  const lists = [
    {
      name: 'Consultation Scheduled',
      description: 'Patients with upcoming consultations'
    },
    {
      name: 'Surgery Scheduled',
      description: 'Patients with scheduled surgeries'
    },
    {
      name: 'Post-Operative',
      description: 'Patients in post-operative recovery'
    },
    {
      name: 'Follow-Up Required',
      description: 'Patients requiring follow-up appointments'
    },
    {
      name: 'Marketing List',
      description: 'Patients opted in for marketing communications'
    }
  ];

  for (const list of lists) {
    await birdApiClient.post('/contacts/lists', list);
  }
}

// Add contact to list
async function addContactToList(contactId: string, listId: string): Promise<void> {
  await birdApiClient.post(`/contacts/lists/${listId}/contacts`, {
    contactId
  });
}

// Remove contact from list
async function removeContactFromList(contactId: string, listId: string): Promise<void> {
  await birdApiClient.delete(`/contacts/lists/${listId}/contacts/${contactId}`);
}
```

### Dynamic List Management

```typescript
// Automatically manage contact lists based on patient status
class PatientListManager {
  private readonly listIds = {
    consultation: 'consultation-scheduled',
    surgery: 'surgery-scheduled',
    postOp: 'post-operative',
    followUp: 'follow-up-required',
    marketing: 'marketing-list'
  };

  async updatePatientLists(contact: MedicalContact): Promise<void> {
    const contactId = contact.id;
    
    // Remove from all lists first
    await this.removeFromAllLists(contactId);
    
    // Add to appropriate lists based on current status
    if (contact.attributes.surgeryStatus === 'scheduled') {
      await addContactToList(contactId, this.listIds.surgery);
    } else if (contact.attributes.surgeryStatus === 'completed') {
      await addContactToList(contactId, this.listIds.postOp);
    }
    
    if (contact.attributes.followUpRequired) {
      await addContactToList(contactId, this.listIds.followUp);
    }
    
    if (contact.attributes.marketingMessages) {
      await addContactToList(contactId, this.listIds.marketing);
    }
  }

  private async removeFromAllLists(contactId: string): Promise<void> {
    for (const listId of Object.values(this.listIds)) {
      try {
        await removeContactFromList(contactId, listId);
      } catch (error) {
        // Contact might not be in the list, continue
      }
    }
  }
}
```

## Contact Events and Interactions

### Tracking Contact Events

```typescript
// Track contact events for medical compliance
interface ContactEvent {
  contactId: string;
  type: ContactEventType;
  timestamp: string;
  details: Record<string, any>;
  source: 'appointment' | 'message' | 'call' | 'email' | 'surgery';
}

enum ContactEventType {
  CONTACT_CREATED = 'contact_created',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  APPOINTMENT_COMPLETED = 'appointment_completed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  SURGERY_SCHEDULED = 'surgery_scheduled',
  SURGERY_COMPLETED = 'surgery_completed',
  PAYMENT_RECEIVED = 'payment_received',
  FOLLOW_UP_REQUIRED = 'follow_up_required'
}

// Create contact event
async function createContactEvent(event: ContactEvent): Promise<void> {
  await birdApiClient.post('/contacts/events', event);
}

// Example: Track appointment scheduling
async function trackAppointmentScheduled(
  contactId: string,
  appointmentDate: string,
  appointmentType: string
): Promise<void> {
  const event: ContactEvent = {
    contactId,
    type: ContactEventType.APPOINTMENT_SCHEDULED,
    timestamp: new Date().toISOString(),
    details: {
      appointmentDate,
      appointmentType,
      scheduledBy: 'system'
    },
    source: 'appointment'
  };

  await createContactEvent(event);
}
```

## Phone Number Validation

### Number Formatting and Validation

```typescript
// Phone number validation and formatting
class PhoneNumberValidator {
  static async validateAndFormat(phoneNumber: string): Promise<PhoneValidationResult> {
    try {
      const response = await birdApiClient.post('/contacts/phone/validate', {
        phoneNumber
      });
      
      return {
        isValid: true,
        formattedNumber: response.data.formattedNumber,
        countryCode: response.data.countryCode,
        carrier: response.data.carrier
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  static async lookupPhoneNumber(phoneNumber: string): Promise<PhoneNumberInfo> {
    const response = await birdApiClient.get('/contacts/phone/lookup', {
      params: { phoneNumber }
    });
    
    return response.data;
  }
}

interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  countryCode?: string;
  carrier?: string;
  error?: string;
}

interface PhoneNumberInfo {
  phoneNumber: string;
  countryCode: string;
  countryName: string;
  carrier: string;
  type: 'mobile' | 'landline' | 'voip';
  valid: boolean;
}
```

## Duplicate Detection and Merging

### Identifying Duplicate Contacts

```typescript
// Duplicate detection service
class DuplicateDetectionService {
  static async findDuplicates(contact: MedicalContact): Promise<MedicalContact[]> {
    const searchCriteria = [];
    
    // Search by phone number
    if (contact.attributes.phone) {
      searchCriteria.push({
        identifier: contact.attributes.phone,
        type: 'phone'
      });
    }
    
    // Search by email
    if (contact.attributes.email) {
      searchCriteria.push({
        identifier: contact.attributes.email,
        type: 'email'
      });
    }
    
    // Search by name + date of birth
    if (contact.attributes.firstName && contact.attributes.lastName && contact.attributes.dateOfBirth) {
      searchCriteria.push({
        firstName: contact.attributes.firstName,
        lastName: contact.attributes.lastName,
        dateOfBirth: contact.attributes.dateOfBirth
      });
    }
    
    const duplicates: MedicalContact[] = [];
    
    for (const criteria of searchCriteria) {
      const results = await this.searchByCriteria(criteria);
      duplicates.push(...results.filter(r => r.id !== contact.id));
    }
    
    return this.removeDuplicatesFromArray(duplicates);
  }

  private static async searchByCriteria(criteria: any): Promise<MedicalContact[]> {
    const response = await birdApiClient.get('/contacts', {
      params: criteria
    });
    
    return response.data.results;
  }

  private static removeDuplicatesFromArray(contacts: MedicalContact[]): MedicalContact[] {
    const seen = new Set<string>();
    return contacts.filter(contact => {
      if (seen.has(contact.id)) {
        return false;
      }
      seen.add(contact.id);
      return true;
    });
  }

  static async mergeContacts(
    primaryContact: MedicalContact,
    duplicateContact: MedicalContact
  ): Promise<MedicalContact> {
    // Merge attributes, preferring non-null values
    const mergedAttributes = {
      ...duplicateContact.attributes,
      ...primaryContact.attributes
    };
    
    // Merge identifiers
    const mergedIdentifiers = [
      ...primaryContact.identifiers,
      ...duplicateContact.identifiers.filter(
        dupId => !primaryContact.identifiers.some(
          primId => primId.value === dupId.value
        )
      )
    ];
    
    // Update primary contact
    const updatedContact = await updateMedicalContact(primaryContact.id, mergedAttributes);
    
    // Transfer any associated data (events, lists, etc.)
    await this.transferContactData(duplicateContact.id, primaryContact.id);
    
    // Delete duplicate contact
    await birdApiClient.delete(`/contacts/${duplicateContact.id}`);
    
    return updatedContact;
  }

  private static async transferContactData(
    fromContactId: string,
    toContactId: string
  ): Promise<void> {
    // Transfer contact events
    await birdApiClient.post(`/contacts/${fromContactId}/transfer-events`, {
      targetContactId: toContactId
    });
    
    // Transfer list memberships
    await birdApiClient.post(`/contacts/${fromContactId}/transfer-lists`, {
      targetContactId: toContactId
    });
  }
}
```

## Integration with Medical Systems

### Agenda Pro Integration

```typescript
// Sync contacts with Agenda Pro
class AgendaProContactSync {
  static async syncContactToAgendaPro(contact: MedicalContact): Promise<void> {
    const agendaProPatient = {
      firstName: contact.attributes.firstName,
      lastName: contact.attributes.lastName,
      phone: contact.attributes.phone,
      email: contact.attributes.email,
      dateOfBirth: contact.attributes.dateOfBirth,
      medicalRecordNumber: contact.attributes.medicalRecordNumber,
      // Map other relevant fields
    };

    // Call Agenda Pro API
    await agendaProApiClient.post('/patients', agendaProPatient);
  }

  static async syncFromAgendaPro(agendaProPatient: any): Promise<MedicalContact> {
    const existingContact = await findContactByPhone(agendaProPatient.phone);
    
    if (existingContact) {
      return await updateMedicalContact(existingContact.id, {
        firstName: agendaProPatient.firstName,
        lastName: agendaProPatient.lastName,
        email: agendaProPatient.email,
        dateOfBirth: agendaProPatient.dateOfBirth,
        medicalRecordNumber: agendaProPatient.medicalRecordNumber
      });
    } else {
      return await createMedicalContact({
        firstName: agendaProPatient.firstName,
        lastName: agendaProPatient.lastName,
        phone: agendaProPatient.phone,
        email: agendaProPatient.email,
        dateOfBirth: agendaProPatient.dateOfBirth,
        medicalRecordNumber: agendaProPatient.medicalRecordNumber
      });
    }
  }
}
```

## Privacy and Compliance

### Medical Data Protection

```typescript
// Medical data privacy utilities
class MedicalDataProtection {
  static sanitizeContactForLogging(contact: MedicalContact): Partial<MedicalContact> {
    return {
      id: contact.id,
      attributes: {
        firstName: contact.attributes.firstName,
        lastName: contact.attributes.lastName?.charAt(0) + '***',
        phone: contact.attributes.phone?.replace(/\d{4}$/, '****'),
        email: contact.attributes.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        surgeryType: contact.attributes.surgeryType,
        surgeryDate: contact.attributes.surgeryDate,
        surgeryStatus: contact.attributes.surgeryStatus
      }
    };
  }

  static async deleteContactData(contactId: string, reason: string): Promise<void> {
    // Log deletion for compliance
    await createContactEvent({
      contactId,
      type: 'contact_deleted' as ContactEventType,
      timestamp: new Date().toISOString(),
      details: { reason },
      source: 'system'
    });

    // Delete contact
    await birdApiClient.delete(`/contacts/${contactId}`);
  }
}
```

## Performance and Optimization

### Batch Operations

```typescript
// Batch contact operations
class ContactBatchOperations {
  static async createContactsBatch(contacts: Partial<MedicalContactAttributes>[]): Promise<MedicalContact[]> {
    const batchSize = 100;
    const results: MedicalContact[] = [];
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(contact => createMedicalContact(contact))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  static async updateContactsBatch(updates: Array<{id: string, attributes: Partial<MedicalContactAttributes>}>): Promise<void> {
    await Promise.all(
      updates.map(update => updateMedicalContact(update.id, update.attributes))
    );
  }
}
```

## Next Steps

1. **Set up custom attributes**: Define medical-specific contact attributes
2. **Create contact lists**: Set up patient categorization lists
3. **Implement duplicate detection**: Build duplicate contact identification
4. **Set up phone validation**: Implement number formatting and validation
5. **Test integration**: Verify contact operations with Bird.com API

## References

- [Bird.com Contacts API Documentation](https://docs.bird.com/api/contacts-api)
- [Authentication Guide](./bird-authentication.md)
- [Channels API Integration](./bird-channels-api.md)
- [Webhooks for Contact Events](./bird-webhooks.md)