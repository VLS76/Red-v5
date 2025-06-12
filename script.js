// Sample data with 15 people
const people = [
    {
        id: 1,
        name: "Ana García",
        especie: ["Ovina", "Caprina"],
        tecnologia: ["Identificación y monitorización", "Biosensores"],
        lineas: ["Salud animal", "Comportamiento animal"],
        rol: ["IP"],
        institucion: ["CICYTEX"]
    },
    {
        id: 2,
        name: "Carlos Martín",
        especie: ["Vacuna"],
        tecnologia: ["Detección y medición", "Ciencia de datos"],
        lineas: ["Optimización de recursos"],
        rol: ["Postdoc"],
        institucion: ["CICYTEX"]
    },
    {
        id: 3,
        name: "María López",
        especie: ["Porcina", "Avícola"],
        tecnologia: ["Automatización y robots", "Análisis de imágenes"],
        lineas: ["Salud animal", "Monitoreo de emisiones"],
        rol: ["IP"],
        institucion: ["CSIC/INIA"]
    },
    {
        id: 4,
        name: "José Rodríguez",
        especie: ["Ovina"],
        tecnologia: ["Posicionamiento y navegación"],
        lineas: ["Comportamiento animal"],
        rol: ["Predoc"],
        institucion: ["CSIC/INIA"]
    },
    {
        id: 5,
        name: "Laura Fernández",
        especie: ["Cunícula"],
        tecnologia: ["Biosensores", "Ciencia de datos"],
        lineas: ["Reproducción y mejora genética"],
        rol: ["Técnico"],
        institucion: ["IRTA"]
    },
    {
        id: 6,
        name: "Pedro Sánchez",
        especie: ["Vacuna", "Ovina"],
        tecnologia: ["Identificación y monitorización"],
        lineas: ["Salud animal", "Optimización de recursos"],
        rol: ["IP"],
        institucion: ["IUCA"]
    },
    {
        id: 7,
        name: "Carmen Díaz",
        especie: ["Avícola"],
        tecnologia: ["Detección y medición", "Automatización y robots"],
        lineas: ["Monitoreo de emisiones"],
        rol: ["Postdoc"],
        institucion: ["IUCA"]
    },
    {
        id: 8,
        name: "Miguel Torres",
        especie: ["Porcina"],
        tecnologia: ["Análisis de imágenes", "Ciencia de datos"],
        lineas: ["Comportamiento animal", "Reproducción y mejora genética"],
        rol: ["Asesor científico"],
        institucion: ["NEIKER"]
    },
    {
        id: 9,
        name: "Isabel Ruiz",
        especie: ["Caprina", "Ovina"],
        tecnologia: ["Biosensores"],
        lineas: ["Salud animal"],
        rol: ["IP"],
        institucion: ["UAB"]
    },
    {
        id: 10,
        name: "Antonio Jiménez",
        especie: ["Vacuna"],
        tecnologia: ["Posicionamiento y navegación", "Automatización y robots"],
        lineas: ["Optimización de recursos", "Monitoreo de emisiones"],
        rol: ["Predoc"],
        institucion: ["UAB"]
    },
    {
        id: 11,
        name: "Rocío Moreno",
        especie: ["Cunícula", "Avícola"],
        tecnologia: ["Identificación y monitorización", "Análisis de imágenes"],
        lineas: ["Reproducción y mejora genética"],
        rol: ["Postdoc"],
        institucion: ["UCO"]
    },
    {
        id: 12,
        name: "Francisco Herrera",
        especie: ["Porcina", "Vacuna"],
        tecnologia: ["Detección y medición", "Ciencia de datos"],
        lineas: ["Salud animal", "Comportamiento animal"],
        rol: ["IP"],
        institucion: ["UdL/Agrotecnio"]
    },
    {
        id: 13,
        name: "Elena Vargas",
        especie: ["Ovina"],
        tecnologia: ["Biosensores", "Posicionamiento y navegación"],
        lineas: ["Monitoreo de emisiones", "Optimización de recursos"],
        rol: ["Técnico"],
        institucion: ["UdL/Agrotecnio"]
    },
    {
        id: 14,
        name: "David Castro",
        especie: ["Caprina", "Cunícula"],
        tecnologia: ["Automatización y robots"],
        lineas: ["Reproducción y mejora genética", "Comportamiento animal"],
        rol: ["Predoc"],
        institucion: ["UM"]
    },
    {
        id: 15,
        name: "Silvia Ramos",
        especie: ["Avícola", "Porcina"],
        tecnologia: ["Análisis de imágenes", "Identificación y monitorización"],
        lineas: ["Salud animal", "Monitoreo de emisiones"],
        rol: ["IP"],
        institucion: ["USAL"]
    }
];

// Color mapping for fields
const fieldColors = {
    especie: '#e74c3c',
    tecnologia: '#3498db',
    lineas: '#2ecc71',
    rol: '#f39c12',
    institucion: '#9b59b6'
};

// Current filters
let activeFilters = {
    especie: [],
    tecnologia: [],
    lineas: [],
    rol: [],
    institucion: []
};

// D3 network variables
let svg, width, height, simulation, nodes, links;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeNetwork();
    updateVisualization();
});

function toggleFilter(fieldName) {
    const content = document.getElementById(fieldName + '-content');
    const arrow = content.previousElementSibling.querySelector('.arrow');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
}

function updateFilters() {
    // Reset filters
    for (let field in activeFilters) {
        activeFilters[field] = [];
    }
    
    // Get all checked checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const fieldName = checkbox.closest('.filter-section').querySelector('.filter-header').classList[1];
        activeFilters[fieldName].push(checkbox.value);
    });
    
    updateVisualization();
}

function initializeNetwork() {
    svg = d3.select('#network');
    const container = document.querySelector('.network-container');
    width = container.clientWidth;
    height = container.clientHeight;
    
    svg.attr('width', width).attr('height', height);
    
    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(20));
}

function updateVisualization() {
    const filteredPeople = getFilteredPeople();
    const connections = getConnections(filteredPeople);
    
    // Clear previous visualization
    svg.selectAll('*').remove();
    
    if (filteredPeople.length === 0) {
        return;
    }
    
    // Create nodes and links data
    nodes = filteredPeople.map(person => ({
        id: person.id,
        name: person.name,
        person: person,
        isIP: person.rol.includes('IP')
    }));
    
    links = connections;
    
    // Apply institutional clustering for non-IP people
    applyInstitutionalClustering();
    
    // Create links
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', d => `link ${d.field}`)
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);
    
    // Create nodes
    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('class', d => `node ${d.isIP ? 'ip' : 'non-ip'}`)
        .attr('r', d => d.isIP ? 12 : 6)
        .attr('fill', d => getNodeColor(d.person))
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on('click', showPersonDetails);
    
    // Add labels
    const labels = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('class', 'person-name')
        .text(d => d.name)
        .attr('dy', d => d.isIP ? 20 : 15);
    
    // Update simulation
    simulation.nodes(nodes);
    simulation.force('link').links(links);
    simulation.alpha(1).restart();
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
}

function getFilteredPeople() {
    if (Object.values(activeFilters).every(arr => arr.length === 0)) {
        return [];
    }
    
    return people.filter(person => {
        for (let field in activeFilters) {
            if (activeFilters[field].length > 0) {
                const hasMatch = activeFilters[field].some(filter => 
                    person[field].includes(filter)
                );
                if (hasMatch) return true;
            }
        }
        return false;
    });
}

function getConnections(filteredPeople) {
    const connections = [];
    
    for (let i = 0; i < filteredPeople.length; i++) {
        for (let j = i + 1; j < filteredPeople.length; j++) {
            const person1 = filteredPeople[i];
            const person2 = filteredPeople[j];
            const commonFields = getCommonFields(person1, person2);
            
            commonFields.forEach(fieldData => {
                connections.push({
                    source: person1.id,
                    target: person2.id,
                    field: fieldData.field,
                    commonValues: fieldData.values
                });
            });
        }
    }
    
    return connections;
}

function getCommonFields(person1, person2) {
    const commonFields = [];
    
    for (let field in activeFilters) {
        if (activeFilters[field].length > 0) {
            const common = person1[field].filter(value => 
                person2[field].includes(value) && activeFilters[field].includes(value)
            );
            
            if (common.length > 0) {
                commonFields.push({
                    field: field,
                    values: common
                });
            }
        }
    }
    
    return commonFields;
}

function applyInstitutionalClustering() {
    // Group people by institution
    const institutionGroups = {};
    nodes.forEach(node => {
        const institution = node.person.institucion[0];
        if (!institutionGroups[institution]) {
            institutionGroups[institution] = { ips: [], nonIps: [] };
        }
        
        if (node.isIP) {
            institutionGroups[institution].ips.push(node);
        } else {
            institutionGroups[institution].nonIps.push(node);
        }
    });
    
    // Apply satellite positioning for non-IPs around IPs
    Object.values(institutionGroups).forEach(group => {
        if (group.ips.length > 0 && group.nonIps.length > 0) {
            group.nonIps.forEach((nonIP, index) => {
                const angle = (2 * Math.PI * index) / group.nonIps.length;
                const radius = 50;
                const ip = group.ips[0]; // Use first IP as center
                
                // Set initial position relative to IP
                nonIP.fx = ip.x + radius * Math.cos(angle);
                nonIP.fy = ip.y + radius * Math.sin(angle);
            });
        }
    });
}

function getNodeColor(person) {
    // Color based on primary institution
    const institutionColors = {
        'CICYTEX': '#FF6B6B',
        'CSIC/INIA': '#4ECDC4',
        'IRTA': '#45B7D1',
        'IUCA': '#96CEB4',
        'NEIKER': '#FECA57',
        'UAB': '#FF9FF3',
        'UCO': '#54A0FF',
        'UdL/Agrotecnio': '#5F27CD',
        'UM': '#00D2D3',
        'USAL': '#FF9F43',
        'USC/Campus Terra': '#10AC84',
        'UPV': '#EE5A24'
    };
    
    return institutionColors[person.institucion[0]] || '#95A5A6';
}

function showTooltip(event, d) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = `<strong>Conexión:</strong><br>${d.commonValues.join(', ')}`;
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
    tooltip.classList.add('visible');
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('visible');
}

function showPersonDetails(event, d) {
    const person = d.person;
    const detailsDiv = document.getElementById('person-info');
    
    let html = `<div class="person-field"><strong>Nombre:</strong> <span>${person.name}</span></div>`;
    html += `<div class="person-field"><strong>Especie:</strong> <span>${person.especie.join(', ')}</span></div>`;
    html += `<div class="person-field"><strong>Tecnología:</strong> <span>${person.tecnologia.join(', ')}</span></div>`;
    html += `<div class="person-field"><strong>Líneas:</strong> <span>${person.lineas.join(', ')}</span></div>`;
    html += `<div class="person-field"><strong>Rol:</strong> <span>${person.rol.join(', ')}</span></div>`;
    html += `<div class="person-field"><strong>Institución:</strong> <span>${person.institucion.join(', ')}</span></div>`;
    
    detailsDiv.innerHTML = html;
}

// D3 drag functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Handle window resize
window.addEventListener('resize', function() {
    const container = document.querySelector('.network-container');
    width = container.clientWidth;
    height = container.clientHeight;
    
    svg.attr('width', width).attr('height', height);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(1).restart();
});