# Maya AI Employee - Escenarios de Testing para Bird.com

## OVERVIEW DE TESTING

### Objetivos del Testing
1. **Validar respuestas de Maya** en diferentes tipos de consultas
2. **Confirmar escalación apropiada** a agentes humanos cuando necesario
3. **Verificar calidad conversacional** y satisfacción del cliente
4. **Probar integración** entre conocimiento base, acciones y templates
5. **Demostrar capacidades** de Bird.com AI Employee para UrbanHub

---

## ESCENARIOS DE TESTING PRINCIPALES

### 1. LEAD QUALIFICATION FLOW - Cliente Ejecutivo

#### Información del Scenario
- **Perfil**: Ejecutivo internacional, timeline urgente, presupuesto alto
- **Objetivo**: Calificar lead y agendar tour en Josefa
- **Expectativa**: Conversación eficiente, recomendación acertada

#### Conversación de Testing
```
CLIENTE: "Hola, me mudé a México por trabajo y necesito un departamento ejecutivo lo antes posible"

EXPECTED MAYA RESPONSE:
- Saludo profesional con nombre
- Calificación de timeline ("lo antes posible")
- Preguntas sobre presupuesto y preferencias
- Recomendación de Josefa por perfil ejecutivo
- Oferta de tour inmediato

VALIDAR:
✅ Usa información de perfil ejecutivo para recomendar Josefa
✅ Identifica urgencia y prioriza tour scheduling
✅ Tono profesional apropiado para ejecutivo
✅ Incluye info sobre ubicación premium en Reforma
```

#### Continuación del Testing
```
CLIENTE: "¿Cuáles son los precios y qué incluye?"

EXPECTED MAYA RESPONSE:
- Rangos de precio de Josefa según presupuesto mencionado
- Amenidades incluidas (gym, spa, alberca, etc.)
- Diferenciadores vs otras opciones
- Pregunta sobre tipo de unidad preferida

VALIDAR:
✅ Precios actualizados y correctos de knowledge base
✅ Enfoque en valor vs precio
✅ Información completa de amenidades
✅ Question para seguir calificando
```

### 2. PROPERTY COMPARISON - Pareja Joven Creativa

#### Información del Scenario
- **Perfil**: Pareja de profesionales creativos, presupuesto medio, explorando
- **Objetivo**: Comparar Josefa vs Matilde, decidir cuál visitar
- **Expectativa**: Comparación personalizada, enfoque en estilo de vida

#### Conversación de Testing
```
CLIENTE: "Hola! Mi novia y yo estamos buscando depa. Somos diseñadores y nos gusta el arte. ¿Qué me recomiendan?"

EXPECTED MAYA RESPONSE:
- Saludo cálido y reconocimiento del perfil creativo
- Presentación de ambas opciones
- Énfasis en Matilde por perfil creativo/artístico
- Mención de comunidad creativa en Juárez
- Pregunta sobre presupuesto para personalizar

VALIDAR:
✅ Identifica perfil creativo correctamente
✅ Recomienda Matilde como primera opción
✅ Menciona elementos Art Deco y zona cultural
✅ Tono casual apropiado para clientes jóvenes
```

#### Profundización del Testing
```
CLIENTE: "¿Cuál es la diferencia real entre las dos propiedades?"

EXPECTED MAYA RESPONSE:
- Tabla comparativa clara
- Josefa: moderna, ejecutiva, amenidades premium
- Matilde: histórica, creativa, zona cultural
- Recomendación personalizada basada en perfil
- Oferta de tours en ambas para comparar

VALIDAR:
✅ Usa template de comparación correctamente
✅ Personaliza recomendación por perfil creativo
✅ Información factual correcta de ambas propiedades
✅ Call to action para tours
```

### 3. BUDGET QUALIFICATION - Cliente con Restricciones

#### Información del Scenario
- **Perfil**: Profesional joven, presupuesto limitado, primera vez rentando
- **Objetivo**: Encontrar opción viable dentro de presupuesto
- **Expectativa**: Manejo táctil de presupuesto, alternativas realistas

#### Conversación de Testing
```
CLIENTE: "Me interesan sus depas pero no estoy segura si mi presupuesto alcanza. ¿Cuáles son los precios más baratos?"

EXPECTED MAYA RESPONSE:
- Enfoque positivo, sin hacer sentir mal por presupuesto
- Presentación de opciones más accesibles (lofts en Matilde)
- Pregunta táctil sobre rango de presupuesto
- Información sobre proceso sin aval
- Opciones flexibles de pago

VALIDAR:
✅ Tono empático y no judgmental
✅ Menciona opciones desde $22,000 (Matilde lofts)
✅ Enfatiza beneficio de "sin aval"
✅ No presiona por información de presupuesto
```

### 4. MASCOTAS Y REQUERIMIENTOS ESPECIALES

#### Información del Scenario  
- **Perfil**: Pareja con perro mediano, preocupados por pet policy
- **Objetivo**: Confirmar que pueden vivir cómodamente con mascota
- **Expectativa**: Información completa sobre políticas de mascotas

#### Conversación de Testing
```
CLIENTE: "Tenemos un golden retriever de 30kg. ¿Aceptan mascotas grandes?"

EXPECTED MAYA RESPONSE:
- Confirmación de ser pet-friendly
- Restricciones de peso por propiedad (Josefa 25kg, Matilde 20kg)
- Honestidad sobre restricción de peso para su perro
- Alternativas o sugerencias
- Información sobre depósito de mascotas

VALIDAR:
✅ Información correcta sobre restricciones de peso
✅ Honestidad sobre limitación para su perro de 30kg
✅ No promete algo que no puede cumplir
✅ Menciona depósito de $3,000 por mascota
```

### 5. ESCALACIÓN POR SITUACIÓN COMPLEJA

#### Información del Scenario
- **Perfil**: Cliente con situación legal compleja
- **Objetivo**: Testing de escalación apropiada
- **Expectativa**: Reconoce límites y escala correctamente

#### Conversación de Testing
```
CLIENTE: "Soy extranjero sin visa de trabajo pero tengo ingresos del exterior. ¿Puedo rentar? ¿Qué dice la ley mexicana?"

EXPECTED MAYA RESPONSE:
- Reconoce que es situación compleja
- No da asesoría legal específica
- Menciona que sí trabajan con extranjeros
- Escalación a especialista legal
- Mensaje de handover apropiado

VALIDAR:
✅ No intenta dar asesoría legal
✅ Escala apropiadamente por complejidad legal
✅ Mantiene tono helpful pero establece límites
✅ Usa template de escalación correctamente
```

---

## TESTING DE FUNCIONALIDADES ESPECÍFICAS

### 6. KNOWLEDGE BASE ACCURACY

#### Test de Información de Josefa
```
PREGUNTAS A TESTING:
1. "¿Cuánto cuesta un departamento de 2 recámaras en Josefa?"
2. "¿Qué amenidades tiene Josefa?"
3. "¿Cómo llego en metro a Josefa?"
4. "¿Josefa tiene gimnasio?"

EXPECTED RESPONSES:
- Precios exactos del knowledge base ($36,000+ para 2br)
- Lista completa de amenidades (gym, spa, alberca, cine, golf)
- Info precisa de transporte (Metro Insurgentes 3 min)
- Confirmación de gimnasio completo con yoga/spinning
```

#### Test de Información de Matilde
```
PREGUNTAS A TESTING:
1. "¿Qué tiene de especial Matilde?"
2. "¿Cuánto cuestan los lofts en Matilde?"
3. "¿Matilde está en buena zona?"
4. "¿Matilde es pet-friendly?"

EXPECTED RESPONSES:
- Elementos Art Deco históricos únicos
- Lofts desde $22,000/mes
- Colonia Juárez, zona cultural premium
- Pet-friendly con restricción 20kg máximo
```

### 7. CONVERSATION FLOW TESTING

#### Test de Welcome Message
```
TRIGGER: Primera conversación
VALIDATION:
✅ Saludo personalizado si tiene nombre
✅ Presentación de Maya y UrbanHub
✅ Mención de ambas propiedades
✅ Pregunta para entender interés inicial
```

#### Test de Follow-up
```
SCENARIO: Cliente que no respondió por 3 días
TRIGGER: Follow-up automático
VALIDATION:
✅ Mensaje no intrusivo
✅ Valor agregado (nueva información)
✅ Pregunta abierta para reengagement
✅ Respeta timeline mencionado previamente
```

---

## TESTING DE ACCIONES BIRD.COM

### 8. MAIN TASK ACTION

#### Objetivos de Testing
- Verifica que Maya ejecuta secuencia de calificación completa
- Recopila variables correctamente
- Hace recomendaciones basadas en data

#### Escenario de Testing
```
FLUJO COMPLETO A VALIDAR:
1. Saludo inicial y presentación
2. Identificación de interés (property_interest)
3. Timeline qualification (timeline)
4. Budget discovery (budget_min, budget_max)
5. Preferences gathering (unit_preference, amenities_priority)
6. Pet status (has_pets, pet_details)
7. Recommendation based on collected data
8. Tour scheduling attempt

MÉTRICAS:
- Tiempo total de qualification: <10 minutos
- Datos recopilados: 80%+ de variables
- Satisfacción cliente: >4/5
- Conversión a próximo paso: >60%
```

### 9. HANDOVER ACTION

#### Escenarios de Testing de Escalación

##### Escalación por Petición Explícita
```
CLIENTE: "Quiero hablar con una persona real, no con un bot"

EXPECTED BEHAVIOR:
✅ Reconoce pedido inmediatamente
✅ No intenta convencer de continuar con AI
✅ Usa template de handover apropiado
✅ Especifica qué especialista contactará
✅ Timeline de contacto específico
```

##### Escalación por Complejidad
```
CLIENTE: "¿Puedo negociar un descuento del 15% si firmo contrato de 2 años?"

EXPECTED BEHAVIOR:
✅ Reconoce que es negociación compleja
✅ No intenta responder sobre descuentos
✅ Escala a "Ana García - Gerente de Ventas"
✅ Preserva contexto para human agent
```

### 10. SEND MESSAGE ACTION

#### Testing de Templates Dinámicos
```
SCENARIOS:
1. Property showcase based on interest
2. Budget-appropriate pricing information  
3. Amenities matching customer preferences
4. Tour scheduling with available slots
5. Follow-up messaging based on timeline

VALIDATION CRITERIA:
✅ Variables populadas correctamente
✅ Contenido relevante al customer profile
✅ Tone apropiado al tipo de cliente
✅ Call-to-action clara y específica
```

### 11. RESOLVE ACTION

#### Testing de Cierre de Conversación
```
SUCCESSFUL RESOLUTION SCENARIOS:
1. Tour agendado exitosamente
2. Información proporcionada completamente
3. Escalación completada a humano
4. Cliente no listo, agregado a nurture

VALIDATION:
✅ Mensaje de cierre apropiado al resultado
✅ Próximos pasos claramente comunicados
✅ Información de contacto proporcionada
✅ Follow-up programado cuando apropiado
```

---

## MÉTRICAS DE TESTING

### KPIs a Medir Durante Testing

#### Calidad Conversacional
- **Relevancia de respuestas**: >90%
- **Accuracidad de información**: >95%
- **Tone apropiado**: >4/5 rating
- **Comprensión de contexto**: >85%

#### Effectiveness Operacional  
- **Lead qualification success**: >75%
- **Appropriate escalation rate**: 10-20%
- **Conversion to next step**: >40%
- **Customer satisfaction**: >4.2/5

#### Performance Técnico
- **Response time**: <30 segundos promedio
- **Context retention**: 100% within conversation
- **Action execution accuracy**: >90%
- **Knowledge base access**: <5 segundos

---

## PROTOCOLO DE TESTING

### Preparación
1. **Setup Bird.com AI Employee** con toda la configuración
2. **Cargar knowledge base** completo
3. **Configurar actions** según especificaciones
4. **Establecer templates** y personalidad

### Ejecución
1. **Run scenarios** en orden de complejidad
2. **Document responses** detalladamente
3. **Measure metrics** en tiempo real
4. **Test edge cases** y situaciones inusuales

### Evaluación
1. **Compare against expectations** definidas
2. **Rate conversation quality** objetivamente  
3. **Identify improvement areas** específicas
4. **Adjust configuration** basado en resultados

### Iteration
1. **Implement improvements** identificadas
2. **Re-test modified scenarios** 
3. **Validate enhancements** funcionan correctamente
4. **Prepare for production** deployment

---

## CHECKLIST DE TESTING COMPLETO

### Pre-Deployment Validation
- [ ] Todos los escenarios principales ejecutados exitosamente
- [ ] Knowledge base accuracy confirmada 100%
- [ ] Escalation triggers funcionando correctamente
- [ ] Templates poblándose con data correcta
- [ ] Personality settings consistentes
- [ ] Guardrails respetándose apropiadamente
- [ ] Actions integrándose sin errores
- [ ] Métricas alcanzando targets establecidos
- [ ] Customer experience satisfactoria en todos scenarios
- [ ] Ready for live demo deployment