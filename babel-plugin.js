module.exports = function (babel) {
	const t = babel.types;
	const importTpl = babel.template('const SPECIFIERS = require(SOURCE)');
	const exportTpl = babel.template('module.exports = EXPORT');
	return {
		name: 'transform-modules-commonjs-simplified',
		visitor: {
			ImportDeclaration(path) {
				const specs = path.node.specifiers;
				let specifiers;
				if (specs.length === 1 && t.isImportDefaultSpecifier(specs[0])) {
					specifiers = t.clone(specs[0].local);
				}
				else {
					specifiers = babel.types.objectPattern(
						specs.map(s => t.objectProperty(
							s.local,
							s.imported || t.identifier('default'),
							false,
							true
						))
					);
				}
				path.replaceWith(importTpl({
					SPECIFIERS: specifiers,
					SOURCE: t.clone(path.node.source)
				}));
			},
			ExportDefaultDeclaration(path) {
				path.replaceWith(exportTpl({
					EXPORT: t.clone(path.node.declaration)
				}));
			}
		}
	};
};
