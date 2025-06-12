document.addEventListener('DOMContentLoaded', function() {
    // --- DATOS ---
    // Datos de ejemplo para 15 personas
    const peopleData = [
        { id: "Ana García", Especie: ["Ovina", "Caprina"], Tecnología: ["Identificación y monitorización", "Biosensores"], Lineas: ["Salud animal"], Rol: "IP", Institución: "IRTA" },
        { id: "Beatriz Soler", Especie: ["Ovina"], Tecnología: ["Analisis de imágenes"], Lineas: ["Reproducción y mejora genética"], Rol: "Postdoc", Institución: "IRTA" },
        { id: "Carlos Ruiz", Especie: ["Caprina"], Tecnología: ["Ciencia de datos", "Biosensores"], Lineas: ["Salud animal", "Comportamiento animal"], Rol: "Predoc", Institución: "IRTA" },
        { id: "David Jiménez", Especie: ["Vacuna"], Tecnología: ["Automatización y robots", "Posicionamiento y navegación"], Lineas: ["Optimización de recursos"], Rol: "IP", Institución: "UdL/Agrotecnio" },
        { id: "Elena Navarro", Especie: ["Vacuna", "Porcina"], Tecnología: ["Detección y medición"], Lineas: ["Monitoreo de emisiones"], Rol: "Técnico", Institución: "UdL/Agrotecnio" },
        { id: "Fernando Moreno", Especie: ["Porcina"], Tecnología: ["Analisis de imágenes", "Ciencia de datos"], Lineas: ["Comportamiento animal"], Rol: "IP", Institución: "CSIC/INIA" },
        { id: "Gloria Vidal", Especie: ["Avícola"], Tecnología: ["Identificación y monitorización"], Lineas: ["Salud animal"], Rol: "Postdoc", Institución: "NEIKER" },
        { id: "Héctor Alonso", Especie: ["Cunícula"], Tecnología: ["Biosensores"], Lineas: ["Reproducción y mejora genética"], Rol: "Asesor científico", Institución: "UPV" },
        { id: "Irene Sánchez", Especie: ["Vacuna"], Tecnología: ["Posicionamiento y navegación"], Lineas: ["Comportamiento animal"], Rol: "Predoc", Institución: "UCO" },
        { id: "Javier Romero", Especie: ["Ovina", "Porcina"], Tecnología: ["Ciencia de datos"], Lineas: ["Optimización de recursos"], Rol: "IP", Institución: "CICYTEX" },
        { id: "Laura Martín", Especie: ["Porcina", "Avícola"], Tecnología: ["Automatización y robots"], Lineas: ["Monitoreo de emisiones"], Rol: "Postdoc", Institución: "CICYTEX" },
        { id: "Miguel Castillo", Especie: ["Caprina"], Tecnología: ["Analisis de imágenes"], Lineas: ["Salud animal"], Rol: "Técnico", Institución: "USAL" },
        { id: "Nuria Pascual", Especie: ["Vacuna"], Tecnología: ["Identificación y monitorización", "Detección y medición"], Lineas: ["Optimización de recursos"], Rol: "IP", Institución: "UCO" },
        { id: "Óscar Flores", Especie: ["Avícola"], Tecnología: ["Posicionamiento y navegación"], Lineas: ["Comportamiento animal"], Rol: "Predoc", Institución: "UAB" },
        { id: "Pilar Ibáñez", Especie: ["Ovina"], Tecnología: ["Ciencia de datos"], Lineas: ["Reproducción y mejora genética"], Rol: "Postdoc", Institución: "CSIC/INIA" }
    ];

    // Definiciones de filtros y colores asociados
    const filters = {
        Especie: { indicators: ["Ovina", "Caprina", "Vacuna", "Porcina", "Avícola", "Cunícula"], color: "#ef4444" },
        Tecnología: { indicators: ["Identificación y monitorización", "Detección y medición", "Biosensores", "Posicionamiento y navegación", "Automatización y robots", "Analisis de imágenes", "Ciencia de datos"], color: "#3b82f6" },
        Lineas: { indicators: ["Salud animal", "Optimización de recursos", "Comportamiento animal", "Monitoreo de emisiones", "Reproducción y mejora genética"], color: "#10b981" },
        Rol: { indicators: ["IP", "Postdoc", "Predoc", "Técnico", "Asesor científico"], color: "#f97316" },
        Institución: { indicators: ["CICYTEX", "CSIC/INIA", "IRTA", "IUCA", "NEIKER", "UAB", "UCO", "UdL/Agrotecnio", "UM", "USAL", "USC/Campus Terra", "UPV"], color: "#8b5cf6" }
    };

    let selectedFilters = {};

    // --- CONFIGURACIÓN DE D3 ---
    const width = document.getElementById('visualization-container').clientWidth;
    const height = document.getElementById('visualization-container').clientHeight;
    const svg = d3.select("#network-graph").attr("viewBox", [0, 0, width, height]);
    const tooltip = d3.select("#tooltip");
    const institutionColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(filters['Institución'].indicators);
    let link, node;
    
    // Crear un grupo para aplicar las transformaciones de zoom
    const zoomGroup = svg.append("g").attr("id", "zoom-group");

    const linkGroup = zoomGroup.append("g").attr("class", "links");
    const nodeGroup = zoomGroup.append("g").attr("class", "nodes");
    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Configurar el comportamiento de zoom
    const zoom = d3.zoom()
        .scaleExtent([0.2, 5]) // Límites de escala (20% a 500%)
        .on("zoom", (event) => {
            zoomGroup.attr("transform", event.transform); // Aplicar la transformación de zoom al grupo
        });

    svg.call(zoom); // Habilitar zoom en el SVG

    // --- INICIALIZACIÓN DE LA UI ---
    const filtersContainer = document.getElementById('filters-container');
    const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s/g, '');

    Object.keys(filters).forEach(field => {
        const fieldKey = normalizeString(field);
        const accordion = document.createElement('div');
        accordion.className = `bg-white rounded-lg shadow-sm border ${'border-' + fieldKey}`;
        const button = document.createElement('button');
        button.className = 'accordion-button w-full p-4 text-left font-bold text-lg text-gray-700 flex justify-between items-center';
        button.innerHTML = `<span>${field}</span><span>&#9662;</span>`;
        const content = document.createElement('div');
        // La clase 'accordion-content' ya tiene padding-top definido en style.css
        content.className = 'accordion-content px-4 pb-4'; 
        content.innerHTML = filters[field].indicators.map(indicator => `
            <label class="flex items-center space-x-3 mt-2 text-gray-600">
                <input type="checkbox" data-field="${field}" value="${indicator}" class="form-checkbox h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500">
                <span>${indicator}</span>
            </label>`).join('');
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const icon = button.querySelector('span:last-child');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.innerHTML = '&#9662;';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.innerHTML = '&#9652;';
            }
        });
        accordion.appendChild(button);
        accordion.appendChild(content);
        filtersContainer.appendChild(accordion);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.addEventListener('change', updateFilters));
    const detailsPanel = document.getElementById('details-panel');
    document.getElementById('close-details').addEventListener('click', () => detailsPanel.classList.add('hidden'));

    // --- LÓGICA PRINCIPAL ---
    function updateFilters() {
        selectedFilters = {};
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            if (!selectedFilters[cb.dataset.field]) selectedFilters[cb.dataset.field] = [];
            selectedFilters[cb.dataset.field].push(cb.value);
        });
        updateVisualization();
    }

    function updateVisualization() {
        // 1. Filtrar personas
        const activeFilterKeys = Object.keys(selectedFilters);
        let filteredPeople = activeFilterKeys.length === 0 ? peopleData : peopleData.filter(person => 
            activeFilterKeys.some(field =>
                selectedFilters[field].some(indicator =>
                    (Array.isArray(person[field]) ? person[field].includes(indicator) : person[field] === indicator)
                )
            )
        );
        if (filteredPeople.length === 0) {
            linkGroup.selectAll("*").remove();
            nodeGroup.selectAll("*").remove();
            return;
        }

        // 2. Preparar nodos y conexiones
        const graphNodes = JSON.parse(JSON.stringify(filteredPeople));
        const graphLinks = [];
        const linkTracker = new Set();
        for (let i = 0; i < graphNodes.length; i++) {
            for (let j = i + 1; j < graphNodes.length; j++) {
                const p1 = graphNodes[i], p2 = graphNodes[j];
                const commonality = { source: p1.id, target: p2.id, reasons: [] };
                Object.keys(filters).forEach(field => {
                    const p1Ind = Array.isArray(p1[field]) ? p1[field] : [p1[field]];
                    const p2Ind = Array.isArray(p2[field]) ? p2[field] : [p2[field]];
                    const shared = p1Ind.filter(ind => p2Ind.includes(ind));
                    if (shared.length > 0) commonality.reasons.push({ field: field, indicators: shared });
                });
                if (commonality.reasons.length > 0) {
                    const linkId = [p1.id, p2.id].sort().join('-');
                    if (!linkTracker.has(linkId)) {
                        graphLinks.push(commonality);
                        linkTracker.add(linkId);
                    }
                }
            }
        }

        // 3. Lógica de diseño IP/satélite
        const institutionGroups = d3.group(graphNodes, d => d.Institución);
        graphNodes.forEach(n => n.nodeType = 'default');
        let satelliteLinks = [];
        institutionGroups.forEach(group => {
            const ips = group.filter(p => p.Rol === 'IP');
            const nonIps = group.filter(p => p.Rol !== 'IP');
            if (ips.length > 0 && nonIps.length > 0) {
                ips.forEach(ip => ip.nodeType = 'ip');
                nonIps.forEach(nonIp => {
                    nonIp.nodeType = 'satellite';
                    satelliteLinks.push({ source: nonIp.id, target: ips[0].id });
                });
            }
        });
        const allLinks = [...graphLinks, ...satelliteLinks];

        // 4. Actualizar visualización D3
        link = linkGroup.selectAll("line").data(allLinks, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
            .join(
                enter => enter.append("line").attr("class", "link")
                    .attr("stroke-width", d => d.reasons ? 2 : 5)
                    .attr("stroke", d => d.reasons ? filters[d.reasons[0].field].color : '#a5b4fc'),
                update => update.attr("stroke", d => d.reasons ? filters[d.reasons[0].field].color : '#a5b4fc'),
                exit => exit.transition().duration(300).attr("stroke-opacity", 0).remove()
            );
        link.filter(d => !!d.reasons).on("mouseover", handleLinkMouseOver).on("mouseout", handleLinkMouseOut);

        node = nodeGroup.selectAll("g.node-group").data(graphNodes, d => d.id)
            .join(
                enter => {
                    const g = enter.append("g").attr("class", "node-group").call(drag(simulation)).on('click', handleNodeClick);
                    g.append("circle").attr("class", d => `node node--${d.nodeType}`)
                        .attr("r", d => d.nodeType === 'satellite' ? 6 : 12)
                        .attr("fill", d => d.nodeType === 'satellite' ? d3.color(institutionColorScale(d.Institución)).brighter(1.5) : institutionColorScale(d.Institución))
                        .attr("stroke", d => institutionColorScale(d.Institución));
                    g.append("text").attr("class", "node-label").attr("x", 15).attr("y", 4).text(d => d.id);
                    return g;
                },
                update => {
                    update.select('circle').transition().duration(300)
                        .attr("r", d => d.nodeType === 'satellite' ? 6 : 12)
                        .attr("fill", d => d.nodeType === 'satellite' ? d3.color(institutionColorScale(d.Institución)).brighter(1.5) : institutionColorScale(d.Institución))
                        .attr("class", d => `node node--${d.nodeType}`);
                    return update;
                },
                exit => exit.transition().duration(300).attr("opacity", 0).remove()
            );
        
        // 5. Reiniciar simulación
        simulation.nodes(graphNodes);
        simulation.force("link", d3.forceLink(allLinks).id(d => d.id)
            .distance(d => d.reasons ? 100 : 40)
            .strength(d => d.reasons ? 0.1 : 1));
        simulation.alpha(1).restart();
    }

    function ticked() {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    // --- MANEJADORES DE EVENTOS ---
    function handleNodeClick(event, d) {
        event.stopPropagation();
        document.getElementById('details-name').textContent = d.id;
        let contentHTML = '';
        Object.keys(filters).forEach(field => {
            const personIndicators = d[field];
            if (personIndicators && personIndicators.length > 0) {
                 contentHTML += `<div class="text-sm"><p class="font-bold text-gray-800">${field}:</p><p class="text-gray-600 pl-2">${Array.isArray(personIndicators) ? personIndicators.join(', ') : personIndicators}</p></div>`;
            }
        });
        document.getElementById('details-content').innerHTML = contentHTML;
        detailsPanel.classList.remove('hidden');
    }

    function handleLinkMouseOver(event, d) {
        tooltip.style('opacity', 1)
               .html(d.reasons.map(r => `<b>${r.field}</b>: ${r.indicators.join(', ')}`).join('<br>'))
               .style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px');
    }
    function handleLinkMouseOut() { tooltip.style('opacity', 0); }

    const drag = simulation => {
      function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
      function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
      function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
    
    // Llamada inicial para dibujar la red completa
    updateVisualization();
});
