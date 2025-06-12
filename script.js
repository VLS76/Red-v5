// --- Field Definitions ---
const fields = [
  {
    name: 'Species',
    color: '#e57373',
    indicators: [
      'Sheep', 'Goat', 'Cattle', 'Swine', 'Poultry', 'Rabbit'
    ]
  },
  {
    name: 'Technology',
    color: '#64b5f6',
    indicators: [
      'Identification and monitoring', 'Detection and measurement', 'Biosensors',
      'Positioning and navigation', 'Automation and robots', 'Image analysis', 'Data science'
    ]
  },
  {
    name: 'Lines',
    color: '#81c784',
    indicators: [
      'Animal health', 'Resource optimization', 'Animal behavior',
      'Emissions monitoring', 'Reproduction and genetic improvement'
    ]
  },
  {
    name: 'Role',
    color: '#ffd54f',
    indicators: [
      'PI (Principal Investigator)', 'Postdoc', 'Predoc', 'Technician', 'Scientific advisor'
    ]
  },
  {
    name: 'Institution',
    color: '#ba68c8',
    indicators: [
      'CICYTEX', 'CSIC/INIA', 'IRTA', 'IUCA', 'NEIKER', 'UAB', 'UCO', 'UdL/Agrotecnio',
      'UM', 'USAL', 'USC/Campus Terra', 'UPV'
    ]
  }
];

// --- Example People Data (15 people with mixed indicators) ---
const people = [
  {
    id: 1, name: "Alice García",
    Species: ["Sheep", "Goat"],
    Technology: ["Biosensors", "Data science"],
    Lines: ["Animal health"],
    Role: ["PI (Principal Investigator)"],
    Institution: ["CSIC/INIA"]
  },
  {
    id: 2, name: "Bernat López",
    Species: ["Cattle"],
    Technology: ["Image analysis", "Automation and robots"],
    Lines: ["Resource optimization"],
    Role: ["Postdoc"],
    Institution: ["CSIC/INIA"]
  },
  {
    id: 3, name: "Clara Ruiz",
    Species: ["Swine", "Poultry"],
    Technology: ["Detection and measurement"],
    Lines: ["Emissions monitoring"],
    Role: ["Technician"],
    Institution: ["IRTA"]
  },
  {
    id: 4, name: "David Martínez",
    Species: ["Rabbit"],
    Technology: ["Identification and monitoring"],
    Lines: ["Animal behavior"],
    Role: ["PI (Principal Investigator)"],
    Institution: ["IRTA"]
  },
  {
    id: 5, name: "Elena Torres",
    Species: ["Cattle", "Swine"],
    Technology: ["Data science", "Image analysis"],
    Lines: ["Reproduction and genetic improvement"],
    Role: ["Predoc"],
    Institution: ["IUCA"]
  },
  {
    id: 6, name: "Francisco Vidal",
    Species: ["Sheep"],
    Technology: ["Biosensors", "Detection and measurement"],
    Lines: ["Animal health", "Resource optimization"],
    Role: ["PI (Principal Investigator)"],
    Institution: ["NEIKER"]
  },
  {
    id: 7, name: "Gemma Serra",
    Species: ["Goat"],
    Technology: ["Automation and robots"],
    Lines: ["Animal behavior"],
    Role: ["Postdoc"],
    Institution: ["NEIKER"]
  },
  {
    id: 8, name: "Hugo Peña",
    Species: ["Poultry", "Rabbit"],
    Technology: ["Positioning and navigation"],
    Lines: ["Resource optimization"],
    Role: ["Technician"],
    Institution: ["UAB"]
  },
  {
    id: 9, name: "Irene Navarro",
    Species: ["Cattle"],
    Technology: ["Data science", "Biosensors"],
    Lines: ["Animal health"],
    Role: ["PI (Principal Investigator)"],
    Institution: ["UCO"]
  },
  {
    id: 10, name: "Jordi Soler",
    Species: ["Sheep"],
    Technology: ["Image analysis"],
    Lines: ["Emissions monitoring"],
    Role: ["Predoc"],
    Institution: ["UCO"]
  },
  {
    id: 11, name: "Karla Jiménez",
    Species: ["Goat", "Cattle"],
    Technology: ["Detection and measurement", "Automation and robots"],
    Lines: ["Reproduction and genetic improvement"],
    Role: ["PI (Principal Investigator)"],
    Institution: ["UdL/Agrotecnio"]
  },
  {
    id: 12, name: "Luis Gómez",
    Species: ["Swine"],
    Technology: ["Biosensors"],
    Lines: ["Animal health", "Resource optimization"],
    Role: ["Postdoc"],
    Institution: ["UM"]
  },
  {
    id: 13, name: "Marina Ortega",
    Species: ["Poultry"],
    Technology: ["Data science", "Image analysis"],
    Lines: ["Animal behavior"],
    Role: ["Scientific advisor"],
    Institution: ["USAL"]
  },
  {
    id: 14, name: "Nuria Ríos",
    Species: ["Rabbit", "Sheep"],
    Technology: ["Identification and monitoring", "Biosensors"],
    Lines: ["Emissions monitoring"],
    Role: ["PI (Principal Investigator)"],
    Institution: ["USC/Campus Terra"]
  },
  {
    id: 15, name: "Oscar Díaz",
    Species: ["Cattle"],
    Technology: ["Positioning and navigation", "Automation and robots"],
    Lines: ["Reproduction and genetic improvement"],
    Role: ["Predoc"],
    Institution: ["UPV"]
  }
];

// --- Utility: Build Field Tabs ---
function createFieldTabs() {
  const aside = document.getElementById('fields');
  fields.forEach(field => {
    const tab = document.createElement('div');
    tab.className = `field-tab ${field.name}`;
    tab.style.borderColor = field.color;

    const header = document.createElement('div');
    header.className = 'field-header';
    header.innerHTML = `<span>${field.name}</span><span>+</span>`;
    header.addEventListener('click', () => {
      tab.classList.toggle('active');
      header.querySelector('span:last-child').textContent = tab.classList.contains('active') ? '–' : '+';
    });

    const content = document.createElement('div');
    content.className = 'field-content';

    field.indicators.forEach(indicator => {
      const id = `filter-${field.name}-${indicator}`.replace(/\s+/g, '-');
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" data-field="${field.name}" value="${indicator}" id="${id}"> ${indicator}`;
      content.appendChild(label);
    });

    tab.appendChild(header);
    tab.appendChild(content);
    aside.appendChild(tab);
  });
}

// --- Filter State ---
const selectedIndicators = {};
fields.forEach(f => selectedIndicators[f.name] = new Set());

// --- Event Handlers for Filters ---
function setupFilterEvents() {
  document.querySelectorAll('input[type="checkbox"][data-field]').forEach(cb => {
    cb.addEventListener('change', () => {
      const field = cb.getAttribute('data-field');
      const value = cb.value;
      if (cb.checked) {
        selectedIndicators[field].add(value);
      } else {
        selectedIndicators[field].delete(value);
      }
      updateNetwork();
    });
  });
}

// --- Network Visualization ---
let network = null;

function getFilteredPeople() {
  // If no filters, show all
  const anySelected = Object.values(selectedIndicators).some(set => set.size > 0);
  if (!anySelected) return people;

  // Show people who match ANY selected indicator in ANY field
  return people.filter(person => {
    return fields.some(field => {
      if (selectedIndicators[field.name].size === 0) return false;
      const personIndicators = person[field.name] || [];
      return personIndicators.some(ind => selectedIndicators[field.name].has(ind));
    });
  });
}

// --- Build Network Data ---
function buildNetworkData(filteredPeople) {
  // Map from id to person
  const idToPerson = {};
  filteredPeople.forEach(p => idToPerson[p.id] = p);

  // Nodes
  const nodes = filteredPeople.map(person => {
    // Node size logic for PI and satellite layout
    let size = 30;
    let color = '#1976d2';
    let isPI = (person.Role || []).includes('PI (Principal Investigator)');
    if (isPI) {
      size = 36;
      color = '#1976d2';
    } else {
      // If in same institution as a PI, make smaller and satellite
      const sameInstitutionPIs = filteredPeople.filter(p2 =>
        p2.Institution[0] === person.Institution[0] &&
        (p2.Role || []).includes('PI (Principal Investigator)')
      );
      if (sameInstitutionPIs.length > 0) {
        size = 22;
        color = '#90caf9';
      }
    }

    // *** CAMBIO CLAVE AQUÍ: Dividir el nombre y el apellido ***
    const nameParts = person.name.split(' ');
    let nodeLabel = person.name; // Por defecto el nombre completo
    if (nameParts.length > 1) {
      // Tomamos la primera parte como nombre y el resto como apellido(s)
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' '); // Une el resto como apellido
      nodeLabel = `${firstName}\n${lastName}`; // Añade un salto de línea
    }
    // *** FIN CAMBIO CLAVE ***

    return {
      id: person.id,
      label: nodeLabel, // Usamos la etiqueta con salto de línea
      title: person.name, // El title (tooltip) sigue mostrando el nombre completo
      size,
      color,
      // font: { size: 16 }, // Asegúrate de que esta línea esté eliminada o comentada
      institution: person.Institution[0],
      isPI
    };
  });

  // Edges: connect people who share at least one indicator in any field
  const edges = [];
  for (let i = 0; i < filteredPeople.length; i++) {
    for (let j = i + 1; j < filteredPeople.length; j++) {
      const p1 = filteredPeople[i];
      const p2 = filteredPeople[j];
      let shared = [];
      fields.forEach(field => {
        const a = new Set(p1[field.name] || []);
        const b = new Set(p2[field.name] || []);
        const overlap = [...a].filter(x => b.has(x));
        if (overlap.length > 0) {
          shared.push(`${field.name}: ${overlap.join(', ')}`);
        }
      });
      if (shared.length > 0) {
        edges.push({
          from: p1.id,
          to: p2.id,
          label: shared.join('\n'), // La etiqueta se mantiene aquí para el hover
          color: { color: '#aaa', highlight: '#1976d2' },
          width: 2
        });
      }
    }
  }

  return { nodes, edges };
}

// --- Update Network ---
function updateNetwork() {
  const filtered = getFilteredPeople();
  const data = buildNetworkData(filtered);

  // Destroy previous network if exists
  if (network) network.destroy();

  const container = document.getElementById('network');
  const options = {
    nodes: {
      shape: 'dot',
      borderWidth: 2,
      shadow: true,
      font: {
        size: 16,
        color: '#000000', // Color del texto a negro
        face: 'arial',
        align: 'center', // Alinea el texto al centro del nodo
        vadjust: 0 // Ajusta la posición vertical del texto (0 para centrar la línea superior)
      }
    },
    edges: {
      smooth: {
        type: 'dynamic'
      },
      font: {
        size: 12,
        align: 'middle',
        color: '#333',
        background: '#fff',
        strokeWidth: 0,
      },
      scaling: {
        label: {
          enabled: true,
          min: 8,
          max: 20
        }
      },
      chosen: {
        label: true
      },
      hoverWidth: 0.5
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -4000,
        centralGravity: 0.3,
        springLength: 120,
        springConstant: 0.05,
        damping: 0.09
      }
    },
    layout: {
      improvedLayout: true
    },
    interaction: {
      hover: true,
      tooltipDelay: 100
    }
  };

  network = new vis.Network(container, data, options);

  // Node click: show person info
  network.on("click", function(params) {
    if (params.nodes.length > 0) {
      const personId = params.nodes[0];
      showPersonInfo(personId);
    } else {
      hidePersonInfo();
    }
  });
}

// --- Person Info Box ---
function showPersonInfo(personId) {
  const person = people.find(p => p.id === personId);
  if (!person) return;
  const box = document.getElementById('person-info');
  box.innerHTML = `
    <h3>${person.name}</h3>
    ${fields.map(field => {
      const vals = person[field.name] || [];
      return `<div><b>${field.name}:</b> ${vals.length ? vals.join(', ') : '<i>None</i>'}</div>`;
    }).join('')}
    <button class="close-btn" onclick="hidePersonInfo()">Close</button>
  `;
  box.classList.remove('hidden');
}

function hidePersonInfo() {
  document.getElementById('person-info').classList.add('hidden');
}

// Expose for button
window.hidePersonInfo = hidePersonInfo;

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
  createFieldTabs();
  setupFilterEvents();
  updateNetwork();
});
