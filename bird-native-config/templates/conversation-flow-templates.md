# Maya AI Employee - Conversation Flow Templates for Bird.com

## TEMPLATE SYSTEM OVERVIEW

Estos templates están diseñados para ser utilizados en el sistema de "Send Message" actions de Bird.com. Cada template es modular y se adapta dinámicamente al contexto de la conversación y las variables recopiladas del cliente.

---

## 1. WELCOME & GREETING TEMPLATES

### Template: Initial Welcome
```
¡Hola {{customer_name}}! 👋 

Soy Maya, tu asistente especializada de UrbanHub. Me da mucho gusto conocerte.

Vi que te interesan nuestros departamentos premium en Ciudad de México. ¡Perfecto! Tengo dos propiedades increíbles para mostrarte:

🏢 **Josefa** - Reforma 390 (junto al Ángel)
🏛️ **Matilde** - Donato Guerra 1 (Juárez, zona cultural)

¿Te gustaría que te cuente más sobre alguna en particular, o prefieres que te explique de ambas? 😊
```

### Template: Return Customer Welcome
```
¡Hola de nuevo {{customer_name}}! 👋

¡Qué gusto verte por aquí otra vez! Veo que sigues interesado en encontrar tu hogar ideal en nuestras propiedades.

¿En qué te puedo ayudar hoy? ¿Quieres que continuemos donde lo dejamos o tienes nuevas preguntas? 🏠
```

### Template: Time-Based Greeting
```
¡{{greeting_time}} {{customer_name}}! ☀️/🌙

Soy Maya de UrbanHub. {{time_context_message}}

Estoy aquí para ayudarte a encontrar el departamento perfecto en nuestras ubicaciones premium de CDMX. 

¿En qué te puedo ayudar hoy?

Variables:
- Morning: "¡Qué excelente manera de empezar el día buscando tu nuevo hogar!"
- Afternoon: "Perfecto momento para pensar en tu próxima mudanza."
- Evening: "Ideal para planear tu futuro en una nueva ubicación."
```

---

## 2. PROPERTY INFORMATION TEMPLATES

### Template: Josefa Property Showcase
```
🏢 **JOSEFA - Tu hogar de lujo en Reforma**

📍 **Ubicación de ensueño**: Paseo de la Reforma 390, literalmente junto al Ángel de la Independencia

💰 **Opciones para ti**:
{{#if budget_match}}
{{#each suitable_units}}
• {{unit_type}}: {{size}} - {{price_display}}
{{/each}}
{{else}}
• Studios: 45-55m² desde $25,700/mes
• 1 Recámara: 60-75m² desde $29,000/mes  
• 2 Recámaras: 90-110m² desde $36,000/mes
{{/if}}

✨ **Amenidades que te van a encantar**:
{{#if amenity_preferences}}
{{#each matching_amenities}}
• {{amenity_name}} {{amenity_emoji}}
{{/each}}
{{else}}
• Gimnasio completo + Yoga & Spinning 🏋️
• Spa con sauna y vapor 🧖‍♀️
• Alberca infinity con vista increíble 🏊‍♀️
• Cine privado 🎬
• Simulador de golf ⛳
• Terraza rooftop para eventos 🌃
{{/if}}

🚇 **Súper conectado**: Metro Insurgentes (3 min), Metrobús en la puerta

¿Te gustaría agendar una visita para ver todo en persona? ¡Te va a fascinar! 🤩
```

### Template: Matilde Property Showcase  
```
🏛️ **MATILDE - Vivir en un pedazo de historia**

📍 **Ubicación cultural**: Donato Guerra 1, corazón de la Juárez (zona de galerías y cafés de autor)

💰 **Opciones disponibles**:
{{#if budget_match}}
{{#each suitable_units}}
• {{unit_type}}: {{size}} - {{price_display}}
{{/each}}
{{else}}
• Lofts únicos: 40-50m² desde $22,000/mes
• 1 Recámara: 55-70m² desde $25,500/mes
• 2 Recámaras: 80-95m² desde $32,000/mes
{{/if}}

🎨 **Experiencia Art Deco auténtica**:
• Lobby histórico restaurado con detalles originales
• Elementos Art Deco de 1920s preservados
• Terraza-jardín perfecta para inspirarte ☕
• Gimnasio boutique en ambiente histórico

{{#if customer_profile.creative}}
**¡Perfecto para tu perfil creativo!** 🎨 
La comunidad está llena de artistas, diseñadores y profesionales creativos como tú.
{{/if}}

🚇 **Excelente ubicación**: Metro Juárez (5 min), zona caminable llena de cultura

¿Quieres conocer este lugar único? ¡Cada departamento cuenta una historia! 📚
```

### Template: Property Comparison
```
🤔 **¡Excelente pregunta! Te ayudo a comparar nuestras dos joyas:**

{{#comparison_table}}
| Aspecto | 🏢 Josefa | 🏛️ Matilde |
|---------|-----------|------------|
| **Ubicación** | Reforma (Ángel) | Juárez (Cultural) |
| **Estilo** | Moderno Premium | Art Deco Histórico |
| **Desde** | $25,700/mes | $22,000/mes |
| **Vibe** | Ejecutivo/Internacional | Creativo/Bohemio |
| **Amenidades** | Spa, Alberca, Golf | Jardín, Historia, Arte |
{{/comparison_table}}

**Mi recomendación personalizada**:
{{#if customer_profile}}
Basándome en que {{customer_context}}, creo que {{recommended_property}} sería ideal para ti porque {{recommendation_reason}}.
{{/if}}

¿Te gustaría ver ambas propiedades? ¡Puedo agendar tours consecutivos para que decidas con toda la información! 🏠✨
```

---

## 3. QUALIFICATION QUESTION TEMPLATES

### Template: Timeline Discovery
```
Para encontrarte las mejores opciones disponibles, ¿para cuándo te gustaría mudarte? 📅

{{#quick_options}}
🔥 **En las próximas 2-4 semanas** 
⭐ **En 1-2 meses**
📋 **En 2-6 meses**  
👀 **Solo estoy explorando opciones**
{{/quick_options}}

O si tienes una fecha específica en mente, ¡compártela conmigo! 

Esto me ayuda a mostrarte solo las unidades que estarán disponibles cuando las necesites 😊
```

### Template: Budget Discovery (Tactful)
```
{{customer_name}}, para mostrarte las opciones perfectas para ti, me gustaría entender tu presupuesto.

💡 **Nuestras opciones van desde**:
• Matilde: $22,000 - $38,000/mes
• Josefa: $25,700 - $80,000/mes

¿En qué rango te sientes más cómodo? No hay respuesta incorrecta - solo quiero asegurarme de mostrarte lo que realmente funciona para ti 💰

{{#if show_flexibility}}
Y recuerda: tenemos diferentes opciones de pago y nuestro proceso es súper flexible 😊
{{/if}}
```

### Template: Preferences Deep Dive
```
¡Perfecto! Ya vamos armando tu perfil ideal 🎯

Ahora, para personalizar completamente mi recomendación:

🏠 **¿Qué tipo de espacio buscas?**
{{unit_options_based_on_budget}}

✨ **¿Hay amenidades súper importantes para ti?**
• Gimnasio y wellness 🏋️
• Espacios para trabajar desde casa 💻  
• Áreas sociales para eventos 🎉
• Tranquilidad y privacidad 🧘
• Vista espectacular 🌃

🐕 **¿Tienes mascotas?** (¡somos súper pet-friendly!)

🚗 **¿Cómo te gusta moverte por la ciudad?**

Con esta info te voy a dar una recomendación súper personalizada 😊
```

---

## 4. TOUR SCHEDULING TEMPLATES

### Template: Tour Proposal (High Intent)
```
{{customer_name}}, ¡me encanta tu interés en {{property_name}}! 🤩

**¡Es momento de que lo veas en persona!**

📅 **Horarios disponibles esta semana**:
{{#each available_slots}}
• {{day}} - {{time_options}}
{{/each}}

🎯 **¿Prefieres?**
• **Tour presencial** (45 min, conoces todo + amenidades)
• **Tour virtual** (20 min, desde donde estés)
• **Tour express** (30 min, si tienes poco tiempo)

{{#if multiple_properties}}
¡También puedo agendar {{other_property}} el mismo día para que compares! 
{{/if}}

¿Qué día y horario te viene mejor? ¡Estoy súper emocionada de mostrarte tu posible nuevo hogar! 🏠✨
```

### Template: Tour Confirmation
```
🎉 **¡LISTO {{customer_name}}! Tu visita está confirmada:**

📋 **DETALLES DE TU TOUR**:
📅 {{tour_date}}
🕐 {{tour_time}}  
🏢 {{property_name}}
📍 {{full_address}}
👤 Te recibirá: {{agent_name}}

📱 **Recordatorios programados**:
• 24 horas antes  
• 2 horas antes

💼 **Si quieres aplicar el mismo día, trae**:
• INE o identificación
• Comprobante de ingresos
• ¡Muchas ganas de enamorarte del lugar! 😍

{{#if special_instructions}}
📝 **Nota especial**: {{instructions}}
{{/if}}

¿Alguna pregunta antes de tu visita? ¡Nos vemos muy pronto! 🤗
```

### Template: Tour Follow-up
```
¡Hola {{customer_name}}! 👋

¿Qué tal estuvo tu visita a {{property_name}} ayer?

Espero que te haya encantado tanto como esperábamos 😊

{{#if multiple_properties_toured}}
¿Ya pudiste comparar ambas propiedades? 
{{/if}}

🤔 **¿En qué etapa estás ahora?**
• ¡Me encantó! ¿Cómo aplico?
• Me gustó, pero tengo algunas preguntas
• Necesito pensarlo un poco más
• Quiero ver otras opciones también

Sin presión - solo quiero asegurarme de que tengas toda la info que necesitas para tomar la mejor decisión para ti 🏠

¿En qué más te puedo ayudar?
```

---

## 5. OBJECTION HANDLING TEMPLATES

### Template: Price Concern Response
```
Entiendo perfectamente {{customer_name}} - es una inversión importante y quieres estar seguro del valor 💰

**Déjame mostrarte el valor real que obtienes**:

✅ **Incluido en tu renta**:
• Todas las amenidades premium (gym, spa, alberca, etc.)
• Concierge y seguridad 24/7
• Mantenimiento completo
• Ubicación que otros cobran como premium

📊 **Comparado con opciones similares**:
• Sin aval (ahorras $$ en trámites)
• Sin meses de depósito extra
• Amenidades que en otros lados cuestan $3,000+/mes extra
• Ubicación premium accesible

💡 **Opciones para tu presupuesto**:
{{#if alternative_options}}
{{#each budget_friendly_alternatives}}
• {{property}}: {{unit_type}} - {{adjusted_price}}
{{/each}}
{{/if}}

¿Te gustaría que revisemos opciones más específicas para tu presupuesto? ¡Seguro encontramos algo perfecto! 😊
```

### Template: Timeline Mismatch
```
¡No te preocupes {{customer_name}}! {{timeline_response}}

{{#if timeline.exploring}}
**Es súper inteligente explorar con tiempo** 👏

Te puedo ayudar a:
• Entender bien el mercado actual
• Conocer nuestras propiedades sin presión
• Mantenerte informado de nuevas disponibilidades
• Planificar tu mudanza perfecta

¿Te parece si te agrego a nuestra lista VIP? Te mantendré al tanto de ofertas especiales y nuevas opciones que vayan saliendo.
{{/if}}

{{#if timeline.future}}
**¡Perfecto timing para planear!** ⏰

Mientras llega tu fecha ideal:
• Podemos hacer tours virtuales
• Te comparto info del proceso para que vayas preparando
• Te aviso de unidades que estarán disponibles en {{customer_timeline}}
• Resuelvo todas tus dudas sin prisa

¿Quieres que armemos un plan para tener todo listo cuando sea tu momento?
{{/if}}
```

### Template: Location Concerns
```
{{customer_name}}, ¡excelente pregunta sobre la ubicación! 📍

{{#if property.josefa}}
**Reforma es literalmente el corazón de CDMX**:
• 🏢 Zona financiera - trabajas aquí o cerca
• 🚇 Conectado a TODA la ciudad (Metro + Metrobús)
• 🍽️ Los mejores restaurantes a pie
• 🏥 Hospitales premium (ABC, Ángeles) 
• 🏪 Todo lo que necesitas caminando

**¿Te preocupa el tráfico?** Con Metro Insurgentes en 3 min, ¡te olvidas del coche!
{{/if}}

{{#if property.matilde}}
**Juárez es LA zona que todos quieren**:
• 🎨 Corazón cultural de la ciudad
• ☕ Mejores cafés y restaurantes de autor
• 🚇 Súper conectado (Metro Juárez + Cuauhtémoc)
• 🚶 Todo caminable y seguro
• 📈 Zona en crecimiento constante

**Plus**: Pagas menos que Polanco/Roma y tienes más autenticidad y cultura.
{{/if}}

¿Hay algo específico sobre el área que te preocupa? ¡Te puedo dar todo el contexto que necesites! 🗺️
```

---

## 6. NURTURE & FOLLOW-UP TEMPLATES

### Template: Warm Follow-up (1 week)
```
¡Hola {{customer_name}}! 😊

¿Cómo van tus planes de mudanza?

{{#if previous_interest}}
La última vez hablamos de {{previous_context}}, y quería compartirte algunas novedades que te pueden interesar:

{{updates_relevant_to_customer}}
{{/if}}

{{#if seasonal_content}}
**¡Perfecto momento para mudarse!** 
{{seasonal_message}}
{{/if}}

Sin presión - solo quería mantenerme en contacto y ver si hay algo nuevo en lo que te pueda ayudar 🏠

¿Sigues interesado en conocer nuestras propiedades?
```

### Template: Value-Add Follow-up
```
¡Hola {{customer_name}}! 👋

Te comparto algo que puede interesarte para tus planes futuros:

{{#content_type.neighborhood_guide}}
📍 **GUÍA DEL VECINDARIO: {{area_name}}**

🍽️ **Restaurantes recomendados**:
{{restaurant_recommendations}}

☕ **Cafés para trabajar**:  
{{coworking_cafes}}

🎭 **Vida cultural**:
{{cultural_highlights}}

🚇 **Transporte y movilidad**:
{{transport_tips}}
{{/content_type}}

{{#content_type.market_insight}}  
📊 **UPDATE DEL MERCADO INMOBILIARIO**

{{market_trends_relevant_to_customer}}
{{/content_type}}

¿Te sigue interesando la zona? ¡Puedo agendar un tour cuando estés listo! 😊
```

### Template: Re-engagement
```
¡{{customer_name}}! 🌟

Ha pasado un tiempo desde nuestra última conversación sobre {{previous_topic}}.

{{#if customer_timeline_approaching}}
**¡Tu timeline se acerca!** ⏰
Mencionaste que estarías listo para mudarte {{original_timeline}}. 

¿Sigues en esos planes? Si es así, ¡es perfecto momento para retomar la búsqueda!
{{/if}}

**Novedades desde la última vez**:
{{#each updates}}
• {{update_item}}
{{/each}}

¿Te gustaría que programemos una llamada rápida para ponerte al día? 

O si prefieres, ¡podemos continuar por WhatsApp como siempre! 📱

¿Cómo estás con tus planes de mudanza?
```

---

## 7. CLOSING & RESOLUTION TEMPLATES

### Template: Successful Application
```
🎉 **¡FELICIDADES {{customer_name}}!**

Tu aplicación para {{property_name}} ha sido **APROBADA** ✅

📋 **PRÓXIMOS PASOS**:
1️⃣ **Firma de contrato**: {{contract_signing_details}}
2️⃣ **Pagos iniciales**: {{payment_breakdown}}
3️⃣ **Entrega de llaves**: {{move_in_date}}

👥 **Tu equipo de onboarding**:
• {{onboarding_manager}} - Proceso general
• {{property_manager}} - Vida en la propiedad
• Maya (¡yo!) - Cualquier pregunta que tengas 😊

**¡BIENVENIDO A LA FAMILIA URBANHUB!** 🏠💕

¿Tienes alguna pregunta sobre los próximos pasos?
```

### Template: Information Satisfaction Close
```
{{customer_name}}, ¡me da muchísimo gusto haber podido ayudarte! 😊

Espero que toda la información sobre {{topics_covered}} haya sido útil para tu decisión.

🔄 **Recuerda que estaré aquí siempre que necesites**:
• Más información sobre nuestras propiedades
• Agendar tours cuando estés listo
• Resolver cualquier duda que surja
• Acompañarte en todo el proceso

{{#if customer_timeline}}
Según tu timeline de {{timeline}}, estaré pendiente para contactarte cerca de esa fecha y ver cómo van tus planes 📅
{{/if}}

¡Que tengas un excelente {{time_of_day}} y mucha suerte con tu búsqueda! 🍀

¡Hasta pronto! 👋
```

### Template: Nurture Path Close
```
{{customer_name}}, entiendo perfectamente que necesites más tiempo para esta importante decisión 🤗

**He agregado tu perfil a nuestra lista VIP** ⭐ para mantenerte informado sobre:
• Nuevas disponibilidades que encajen contigo
• Promociones y ofertas especiales
• Updates del mercado inmobiliario
• Eventos en nuestras propiedades

{{#if agreed_follow_up}}
Como acordamos, te contactaré en {{follow_up_timeframe}} para ver cómo van tus planes 📅
{{/if}}

**Mientras tanto**:
• Cualquier pregunta que surja, escríbeme
• Si cambias de timeline, ¡avísame!
• Si quieres tours virtuales, están disponibles 24/7

¡Gracias por considerar UrbanHub para tu próximo hogar! 🏠💕

¡Nos hablamos pronto! 😊
```

---

## TEMPLATE USAGE GUIDELINES

### Variable System
```
CUSTOMER VARIABLES:
- {{customer_name}}: Always use when known
- {{customer_timeline}}: Adjust messaging urgency
- {{budget_range}}: Show relevant options
- {{property_interest}}: Customize content
- {{customer_profile}}: Personalize recommendations

DYNAMIC CONTENT:
- {{#if condition}}: Conditional content blocks
- {{#each array}}: Repeat content for lists
- {{greeting_time}}: Time-appropriate greetings
- {{available_slots}}: Real-time availability
```

### Tone Adaptation
```
FORMAL CUSTOMERS: Use "usted", more structured language
CASUAL CUSTOMERS: Use "tú", conversational tone
URGENT CUSTOMERS: Direct, action-oriented language
EXPLORING CUSTOMERS: Educational, no-pressure approach
```

### Cultural Localization
```
MEXICAN SPANISH:
- Use local expressions naturally
- Understand cultural decision-making patterns
- Respect family involvement in housing decisions
- Adapt to Mexican business communication style
```