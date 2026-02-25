const { v4: uuidv4 } = require('uuid');

const CANALES = ['whatsapp', 'instagram', 'llamada', 'web', 'referido', 'otro'];
const ESTADOS = ['nuevo', 'contactado', 'interesado', 'reunion', 'propuesta', 'cerrado', 'perdido'];
const PRIORIDADES = ['baja', 'media', 'alta'];

const empresas = [
  'Pizzería Don Carlo', 'Bar La Esquina', 'Panadería San José', 'Café Central',
  'Restaurante El Puerto', 'Gimnasio FitLife', 'Peluquería Estilo', 'Ferretería El Martillo',
  'Farmacia Salud', 'Supermercado El Ahorro', 'Taller Mecánico Rápido', 'Clínica Dental Sonrisa',
  'Veterinaria Patitas', 'Lavandería Express', 'Imprenta Gráfica', 'Academia de Inglés',
  'Tienda de Bicis', 'Óptica Vista Clara', 'Florería Jardín', 'Carnicería La Mejor',
  'Inmobiliaria Centro', 'Agencia de Viajes', 'Estudio Contable', 'Asesoría Legal',
  'Transporte Rápido', 'Limpieza Express', 'Seguridad Total', 'Clima Plus',
  'Electricidad Pro', 'Plomería 24h', 'Jardinería Verde', 'Eventos & Fiestas',
  'Catering Gourmet', 'Fotografía Studio', 'Diseño Web Pro', 'Marketing Digital',
  'Consultora Negocios', 'Software Solutions', 'Cloud Services', 'Data Analytics',
  'Seguros del Sur', 'Automotores Norte', 'Inversiones SA', 'Créditos Fácil',
  'Ropa Moda', 'Deportes Total', 'Libros y Más', 'Juguetelandia',
  'Muebles Hogar', 'Decoración Casa', 'Iluminación Led', 'Pinturería Color',
  'Hotelería Plaza', 'Restó Downtown', 'Pub La Esquina', 'Sushi Bar',
  'Panadería Dulce', 'Pastelería Arte', 'Café con Alma', 'Té & Tostadas',
  'Gimnasio Power', 'Yoga Studio', 'Pilates Center', 'CrossFit Box',
  'Escuela de Música', 'Idiomas Online', 'Cursos Tech', 'Capacitación Empresas',
  'Clínica Médica', 'Laboratorio Lab', 'Óptica Vista', 'Farmacia Central',
  'Veterinaria Pet', 'Guardería Kids', 'Geriátrico Paz', 'Centro Deportivo',
  'AutoService', 'Lavado de Autos', 'Neumáticos Pro', 'Mecánica Rápida',
  'Abogados & Asoc', 'Contadores Plus', 'Arquitectura Diseño', 'Ingeniería Pro',
  'Publicidad Creativa', 'RRHH Solutions', 'Logística Total', 'Almacén Central',
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(d, days) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * Genera muchos leads con distribución en todos los estados del pipeline (para Kanban lleno).
 */
function generateLeads(count = 90) {
  const leads = [];
  const usedPhones = new Set();
  const usedEmails = new Set();

  // Repartir por estado para que el Kanban tenga columnas llenas (~12-14 por estado)
  const porEstado = Math.ceil(count / ESTADOS.length);
  let idx = 0;

  for (let e = 0; e < ESTADOS.length; e++) {
    const estado = ESTADOS[e];
    const cuantos = e === ESTADOS.length - 1 ? Math.max(0, count - porEstado * (ESTADOS.length - 1)) : porEstado;

    for (let i = 0; i < cuantos; i++) {
      const k = idx++;
      let telefono = `+54 9 11 ${String(4000000 + k).padStart(7, '0')}`;
      while (usedPhones.has(telefono)) {
        telefono = `+54 9 11 ${Math.floor(4000000 + Math.random() * 5999999)}`;
      }
      usedPhones.add(telefono);

      const emp = empresas[k % empresas.length];
      const suf = k >= empresas.length ? ` ${Math.floor(k / empresas.length) + 1}` : '';
      const emailName = (emp + suf).toLowerCase().replace(/\s+/g, '');
      let email = `${emailName}@ejemplo.com`;
      if (usedEmails.has(email)) email = `contacto${k}@ejemplo.com`;
      usedEmails.add(email);

      const fechaAlta = addDays(new Date(), -Math.floor(Math.random() * 120));
      const ultimoContacto = Math.random() > 0.25 ? addDays(fechaAlta, Math.floor(Math.random() * 45)) : null;
      const activo = !['cerrado', 'perdido'].includes(estado) ? Math.random() > 0.1 : false;

      leads.push({
        id: uuidv4(),
        nombre: `Contacto ${emp}${suf}`,
        empresa: emp + suf,
        telefono,
        email,
        canalOrigen: random(CANALES),
        estadoPipeline: estado,
        ticketEstimado: [0, 25000, 50000, 100000, 150000, 200000, 350000][Math.floor(Math.random() * 7)],
        prioridad: random(PRIORIDADES),
        localidad: ['CABA', 'GBA Norte', 'GBA Sur', 'La Plata', 'Córdoba', 'Mendoza', 'Rosario'][k % 7],
        notas: k % 4 === 0 ? 'Cliente potencial. Seguimiento activo.' : '',
        activo,
        fechaAlta,
        ultimoContacto,
        createdAt: fechaAlta,
        updatedAt: addDays(fechaAlta, Math.floor(Math.random() * 30)),
      });
    }
  }

  return leads;
}

module.exports = { generateLeads };
