import _ from 'lodash';

const createHierarchyFromTree = (data) => data && data.map((rootNode) => {
  const rootNodeObject = {
    key: rootNode.key,
  };

  if (rootNode.children) {
    rootNodeObject.children = rootNode.children.map((child) => ({ key: child.key }));
  }
  return rootNodeObject;
});

const createPropertiesFromTree = (data) => {
  // Create object of properties.
  const properties = {};

  const traverseProperties = ((nodes, parentNode) => {
    if (nodes) {
      nodes.forEach((node) => {
        const {
          key, name, color, cellIds, cellSetKeys, rootNode, type,
        } = node;
        // we either have the cellids or cellSetKeys when its a metadata cluster
        const cellIdsOrCellSetKeys = cellIds ? { cellIds: new Set(cellIds) } : { cellSetKeys };

        properties[key] = {
          name,
          color,
          ...cellIdsOrCellSetKeys,
          rootNode,
          type,
        };

        if (!rootNode && !_.isNil(parentNode)) {
          properties[key].parentNodeKey = parentNode.key;
        }

        if (node.children) {
          traverseProperties(node.children, node);
        }
      });
    }
  });

  traverseProperties(data, null);
  return properties;
};

export { createHierarchyFromTree, createPropertiesFromTree };
