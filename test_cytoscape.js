
document.addEventListener('DOMContentLoaded', function () {

	var cy = window.cy = cytoscape({
		container: document.getElementById('cy'),

		style: [
			{
				selector: 'node',
				style: {
					'content': 'data(id)',
					'label': 'data(id)',
				}
			},

			{
				selector: 'edge',
				style: {
					'curve-style': 'bezier',
					'target-arrow-shape': 'triangle',
					"label": "data(label)",
					"width": 12,
					"line-color": "#0000ff",
					'target-arrow-color': "#0000ff",
					"text-valign": "top",
					"text-wrap": "wrap"
				}
			}
		],

		elements: {
			nodes: [
				{ data: { id: 'a' } },
				{ data: { id: 'b',  label: 'bottom right' }, style: {
					"text-valign": "bottom",
					"text-halign": "left"
				} }
			],
			edges: [
				{ data: { id: 'ab', source: 'a', target: 'b', label: 'roberto\r\nsanchezu', weight: 1000 } }
			]
		},

		layout: {
			name: 'grid'
		}
	});
});