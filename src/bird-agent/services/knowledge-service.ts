import fs from 'fs';
import path from 'path';

export interface Property {
  id: string;
  name: string;
  fullName: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    landmark: string;
  };
  description: string;
  amenities: string[];
  units: {
    [unitType: string]: {
      type: string;
      size: string;
      priceRange: {
        min: number;
        max: number;
        currency: string;
        period: string;
      };
      features: string[];
      availability: number;
    };
  };
  neighborhood: {
    highlights: string[];
    transport: {
      metro: string[];
      metrobus: string[];
      ecobici: boolean;
    };
  };
  policies: {
    lease: {
      minimumTerm: string;
      deposit: string;
      requirements: string[];
    };
    petFriendly: boolean;
    petRestrictions: string;
    included: string[];
    notIncluded: string[];
  };
  targetProfile: string;
}

export interface UrbanHubKnowledge {
  company: {
    name: string;
    brand: string;
    description: string;
    contact: {
      whatsapp: string;
      email: string;
      website: string;
    };
  };
  properties: {
    [propertyId: string]: Property;
  };
  competitiveAdvantages: {
    pricing: string;
    vsCompetitors: any;
    uniqueFeatures: string[];
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  tourAvailability: {
    schedule: {
      [day: string]: string[];
    };
    duration: string;
    virtualTours: boolean;
    sameDay: boolean;
    bookingWindow: string;
  };
}

export class UrbanHubKnowledgeService {
  private knowledge: UrbanHubKnowledge | null = null;
  private knowledgeBasePath: string;

  constructor(knowledgeBasePath?: string) {
    this.knowledgeBasePath = knowledgeBasePath || 
      path.join(__dirname, '../knowledge-base/urbanhub-properties.json');
    this.loadKnowledgeBase();
  }

  private loadKnowledgeBase(): void {
    try {
      if (fs.existsSync(this.knowledgeBasePath)) {
        const rawData = fs.readFileSync(this.knowledgeBasePath, 'utf8');
        this.knowledge = JSON.parse(rawData);
        console.log('✅ UrbanHub knowledge base loaded successfully');
      } else {
        console.error(`❌ Knowledge base file not found: ${this.knowledgeBasePath}`);
      }
    } catch (error) {
      console.error('❌ Error loading knowledge base:', error);
    }
  }

  /**
   * Property Information
   */
  getProperty(propertyId: string): Property | null {
    if (!this.knowledge) return null;
    return this.knowledge.properties[propertyId] || null;
  }

  getAllProperties(): Property[] {
    if (!this.knowledge) return [];
    return Object.values(this.knowledge.properties);
  }

  getPropertiesByBudget(minBudget: number, maxBudget: number): Property[] {
    const properties = this.getAllProperties();
    return properties.filter(property => {
      return Object.values(property.units).some(unit => 
        unit.priceRange.min <= maxBudget && unit.priceRange.max >= minBudget
      );
    });
  }

  getUnitsForProperty(propertyId: string, budgetRange?: { min: number; max: number }): any[] {
    const property = this.getProperty(propertyId);
    if (!property) return [];

    const units = Object.values(property.units);
    
    if (budgetRange) {
      return units.filter(unit => 
        unit.priceRange.min <= budgetRange.max && unit.priceRange.max >= budgetRange.min
      );
    }
    
    return units;
  }

  /**
   * Property Recommendations
   */
  recommendProperties(criteria: {
    budget?: { min: number; max: number };
    timeline?: string;
    preferences?: string[];
    unitType?: string;
  }): Array<{
    property: Property;
    matchScore: number;
    matchReasons: string[];
  }> {
    const properties = this.getAllProperties();
    const recommendations = [];

    for (const property of properties) {
      let score = 0;
      const reasons: string[] = [];

      // Budget matching
      if (criteria.budget) {
        const suitableUnits = this.getUnitsForProperty(property.id, criteria.budget);
        if (suitableUnits.length > 0) {
          score += 30;
          reasons.push(`Tiene ${suitableUnits.length} opciones en tu presupuesto`);
        }
      }

      // Preferences matching
      if (criteria.preferences) {
        for (const pref of criteria.preferences) {
          const prefLower = pref.toLowerCase();
          
          // Check amenities
          const matchingAmenities = property.amenities.filter(amenity =>
            amenity.toLowerCase().includes(prefLower)
          );
          
          if (matchingAmenities.length > 0) {
            score += 15;
            reasons.push(`Tiene ${matchingAmenities.join(', ')}`);
          }

          // Check neighborhood highlights
          const matchingHighlights = property.neighborhood.highlights.filter(highlight =>
            highlight.toLowerCase().includes(prefLower)
          );
          
          if (matchingHighlights.length > 0) {
            score += 10;
            reasons.push(`Ubicación ideal: ${matchingHighlights[0]}`);
          }
        }
      }

      // Timeline urgency bonus
      if (criteria.timeline) {
        const timelineLower = criteria.timeline.toLowerCase();
        if (timelineLower.includes('inmediato') || timelineLower.includes('urgente') || timelineLower.includes('ya')) {
          score += 20;
          reasons.push('Disponibilidad inmediata');
        }
      }

      if (score > 0) {
        recommendations.push({
          property,
          matchScore: score,
          matchReasons: reasons
        });
      }
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * FAQ and Information Retrieval
   */
  findFAQ(question: string): { question: string; answer: string } | null {
    if (!this.knowledge) return null;

    const questionLower = question.toLowerCase();
    const faq = this.knowledge.faqs.find(faq =>
      faq.question.toLowerCase().includes(questionLower) ||
      questionLower.includes(faq.question.toLowerCase().split(' ')[0])
    );

    return faq || null;
  }

  searchFAQs(query: string): Array<{ question: string; answer: string; relevance: number }> {
    if (!this.knowledge) return [];

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    const results = this.knowledge.faqs.map(faq => {
      let relevance = 0;
      const faqText = `${faq.question} ${faq.answer}`.toLowerCase();
      
      for (const word of queryWords) {
        if (faqText.includes(word)) {
          relevance += 1;
        }
      }
      
      return { ...faq, relevance };
    }).filter(result => result.relevance > 0);

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Tour Availability
   */
  getTourAvailability(): any {
    return this.knowledge?.tourAvailability || null;
  }

  getAvailableTimeSlots(date: string): string[] {
    const availability = this.getTourAvailability();
    if (!availability) return [];

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    return availability.schedule[dayOfWeek] || [];
  }

  /**
   * Competitive Information
   */
  getCompetitiveAdvantages(): string[] {
    return this.knowledge?.competitiveAdvantages.uniqueFeatures || [];
  }

  getValueProposition(): string {
    return this.knowledge?.competitiveAdvantages.pricing || 
           'UrbanHub ofrece valor excepcional con amenidades premium y ubicaciones privilegiadas';
  }

  /**
   * Property Comparison
   */
  compareProperties(propertyIds: string[]): any {
    const properties = propertyIds.map(id => this.getProperty(id)).filter(Boolean);
    
    if (properties.length < 2) return null;

    const comparison = {
      properties: properties.map(property => ({
        name: property!.name,
        location: property!.address.neighborhood,
        priceRange: this.getPropertyPriceRange(property!),
        keyAmenities: property!.amenities.slice(0, 3),
        targetAudience: property!.targetProfile
      })),
      differences: this.identifyKeyDifferences(properties as Property[])
    };

    return comparison;
  }

  private getPropertyPriceRange(property: Property): { min: number; max: number } {
    const units = Object.values(property.units);
    const minPrice = Math.min(...units.map(unit => unit.priceRange.min));
    const maxPrice = Math.max(...units.map(unit => unit.priceRange.max));
    
    return { min: minPrice, max: maxPrice };
  }

  private identifyKeyDifferences(properties: Property[]): string[] {
    const differences: string[] = [];
    
    // Price differences
    const priceRanges = properties.map(p => this.getPropertyPriceRange(p));
    const priceDiff = Math.abs(priceRanges[0].min - priceRanges[1].min);
    
    if (priceDiff > 5000) {
      differences.push(`Diferencia de precio significativa: ${priceDiff.toLocaleString()} MXN`);
    }

    // Amenity differences
    const amenities1 = new Set(properties[0].amenities);
    const amenities2 = new Set(properties[1].amenities);
    
    const unique1 = [...amenities1].filter(a => !amenities2.has(a));
    const unique2 = [...amenities2].filter(a => !amenities1.has(a));
    
    if (unique1.length > 0) {
      differences.push(`${properties[0].name} único: ${unique1[0]}`);
    }
    if (unique2.length > 0) {
      differences.push(`${properties[1].name} único: ${unique2[0]}`);
    }

    return differences;
  }

  /**
   * Context-Aware Property Information
   */
  getPropertyInfoForContext(propertyId: string, context: {
    budget?: number;
    preferences?: string[];
    timeline?: string;
  }): string {
    const property = this.getProperty(propertyId);
    if (!property) return 'Propiedad no encontrada';

    let info = `🏢 **${property.fullName}**\n`;
    info += `📍 ${property.address.street}, ${property.address.neighborhood}\n\n`;

    // Add relevant units based on budget
    if (context.budget) {
      const suitableUnits = this.getUnitsForProperty(propertyId, {
        min: 0,
        max: context.budget * 1.1 // 10% flexibility
      });

      if (suitableUnits.length > 0) {
        info += `💰 **Opciones en tu presupuesto:**\n`;
        suitableUnits.forEach(unit => {
          info += `• ${unit.type}: ${unit.size} desde $${unit.priceRange.min.toLocaleString()}/mes\n`;
        });
        info += '\n';
      }
    }

    // Add relevant amenities based on preferences
    if (context.preferences && context.preferences.length > 0) {
      const relevantAmenities = property.amenities.filter(amenity =>
        context.preferences!.some(pref => 
          amenity.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(amenity.toLowerCase())
        )
      );

      if (relevantAmenities.length > 0) {
        info += `✨ **Amenidades que te interesan:**\n`;
        relevantAmenities.forEach(amenity => {
          info += `• ${amenity}\n`;
        });
        info += '\n';
      }
    }

    // Add urgency info if timeline is short
    if (context.timeline && 
        (context.timeline.toLowerCase().includes('inmediato') || 
         context.timeline.toLowerCase().includes('urgente'))) {
      info += `⚡ **Disponibilidad inmediata** - Puedes mudarte este fin de semana\n\n`;
    }

    info += `📋 **Proceso súper fácil:** Sin aval, documentos mínimos, aprobación en 24-48hrs`;

    return info;
  }

  /**
   * Health Check
   */
  healthCheck(): { healthy: boolean; details: any } {
    return {
      healthy: this.knowledge !== null,
      details: {
        knowledgeBaseLoaded: this.knowledge !== null,
        propertiesCount: this.knowledge ? Object.keys(this.knowledge.properties).length : 0,
        faqsCount: this.knowledge ? this.knowledge.faqs.length : 0,
        lastUpdated: this.knowledge ? new Date().toISOString() : null
      }
    };
  }

  /**
   * Reload knowledge base (useful for updates)
   */
  reload(): boolean {
    try {
      this.loadKnowledgeBase();
      return this.knowledge !== null;
    } catch (error) {
      console.error('❌ Error reloading knowledge base:', error);
      return false;
    }
  }
}