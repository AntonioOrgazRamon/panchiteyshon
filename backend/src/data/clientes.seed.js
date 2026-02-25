const { v4: uuidv4 } = require('uuid');
const { ESTADOS_CLIENTE } = require('../models/cliente.model');

const SERVICIOS = ['Web', 'Marketing', 'Consultoría', 'Soporte mensual', 'Formación', 'Desarrollo a medida', 'SEO', 'Redes sociales', 'Email marketing'];
const empresas = [
  'Tech Solutions SA', 'Consultora Norte', 'Digital Agency', 'Cloud Services', 'Software House',
  'Innova Corp', 'DataLab', 'Seguridad IT', 'E-commerce Pro', 'App Factory',
  'Web Studio', 'Marketing Plus', 'Consulting Group', 'Data Pro', 'Cloud Nine',
  'Dev Factory', 'Design Co', 'Growth Lab', 'Sales Force', 'Support Central',
  'Academy Online', 'Training Pro', 'Edu Tech', 'Legal Digital', 'Health Tech',
  'Fintech Solutions', 'Logistics Pro', 'Retail Plus', 'Food Delivery Co', 'Travel Agency',
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
 * Genera muchos clientes. Algunos con leadOrigenId (convertidos desde lead).
 */
function generateClientes(leadIds = []) {
  const clientes = [];
  const usedPhones = new Set();
  const usedEmails = new Set();

  for (let i = 0; i < empresas.length; i++) {
    const telefono = `+54 9 11 5${String(1000000 + i).slice(0, 7)}`;
    const email = `cliente${empresas[i].toLowerCase().replace(/\s+/g, '')}@empresa.com`;
    if (usedPhones.has(telefono) || usedEmails.has(email)) continue;
    usedPhones.add(telefono);
    usedEmails.add(email);

    const fechaAlta = addDays(new Date(), -Math.floor(Math.random() * 365));
    const proximaRevision = Math.random() > 0.35 ? addDays(new Date(), 5 + Math.floor(Math.random() * 60)) : null;
    const numServicios = 1 + Math.floor(Math.random() * 3);
    const serviciosContratados = [];
    for (let s = 0; s < numServicios; s++) {
      const sv = random(SERVICIOS);
      if (!serviciosContratados.includes(sv)) serviciosContratados.push(sv);
    }

    clientes.push({
      id: uuidv4(),
      nombreContacto: `Contacto ${empresas[i]}`,
      empresa: empresas[i],
      telefono,
      email,
      ciudad: ['CABA', 'GBA Norte', 'Córdoba', 'Mendoza', 'Rosario', 'La Plata', 'Tucumán'][i % 7],
      web: i % 2 === 0 ? `https://${empresas[i].toLowerCase().replace(/\s+/g, '')}.com` : '',
      estadoCliente: random(ESTADOS_CLIENTE),
      serviciosContratados,
      mrr: Math.random() > 0.25 ? Math.floor(3000 + Math.random() * 47000) : null,
      fechaAlta,
      ultimaInteraccion: Math.random() > 0.25 ? addDays(fechaAlta, Math.floor(Math.random() * 90)) : null,
      proximaRevision,
      observacionesInternas: i % 4 === 0 ? 'Cliente clave. Revisar renovación.' : '',
      leadOrigenId: leadIds.length > 0 && i < 5 ? leadIds[i % leadIds.length] : null,
      createdAt: fechaAlta,
      updatedAt: new Date(),
    });
  }

  return clientes;
}

module.exports = { generateClientes };
