import {generateKeyBetween, generateNKeysBetween} from 'fractional-indexing';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const BASE_95 = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

const rawdata = fs.readFileSync('input.json');
const project = JSON.parse(rawdata);
const newProject = _.cloneDeep(project);

Object.keys(project.data).forEach(nodeType => {
  const nodes = project.data[nodeType].byId;
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    if (Array.isArray(nodes[nodeId]?.children)) {
      const children = {};
      const childrenIndexes = generateNKeysBetween(null, null, node.children.length, BASE_95);

      node.children.forEach((descId, index) => {
        children[descId] = childrenIndexes[index];
      });
      newProject.data[nodeType].byId[nodeId].children = children;
    }
    switch (nodeType) {
      case 'branches':
        if (Array.isArray(node?.conditions?.elseIfConditions)){
          const elseIfConditions = {};
          const condIndexes = generateNKeysBetween(null, null, node.conditions.elseIfConditions.length, BASE_95);
  
          node.conditions.elseIfConditions.forEach((condId, index) => {
            elseIfConditions[condId] = condIndexes[index];
          });
          newProject.data[nodeType].byId[nodeId].conditions.elseIfConditions = elseIfConditions;
        }
        break;
      case 'elements':
        if (Array.isArray(node?.components)) {
          const components = {};
          const componentIndexes = generateNKeysBetween(null, null, node.components.length, BASE_95);

          node.components.forEach((comp, index) => {
            components[comp.id] = {
              rId: comp.id,
              id: comp.component,
              index: componentIndexes[index]
            };
          });
          newProject.data[nodeType].byId[nodeId].components = components;
        }
        if (Array.isArray(node?.outputs)) {
          const outputs = {};
          const outputsIndexes = generateNKeysBetween(null, null, node.outputs.length, BASE_95);

          node.outputs.forEach((output, index) => {
            outputs[output] = outputsIndexes[index];
          });
          newProject.data[nodeType].byId[nodeId].outputs = outputs;
        }
        break;
      case 'attributes':
        if (node?.value?.type === 'component-list') {
          const components = {};
          const componentIndexes = generateNKeysBetween(null, null, node.value.data.length, BASE_95);

          node.value.data.forEach((comp, index) => {
            components[comp.id] = {
              rId: comp.id,
              id: comp.component,
              index: componentIndexes[index],
            };
          });
          newProject.data[nodeType].byId[nodeId].value.data = components;
        }
        break;
      case 'components':
        if (Array.isArray(node?.attributes)) {
          const attributes = {};
          const attrIndexes = generateNKeysBetween(null, null, node.attributes.length, BASE_95);
          
          node.attributes.forEach((attr, index) => {
            attributes[attr] = attrIndexes[index];
          });

          newProject.data[nodeType].byId[nodeId].attributes = attributes;
        }
        break;
      case 'boards':
        Object.keys(node).forEach(prop => {
          if (Array.isArray(node[prop]) && prop !== 'children') {
            const nodeTypeRefs = {};
            const indexes = generateNKeysBetween(null, null, node[prop].length, BASE_95);
            
            node[prop].forEach((id, index) => {
              nodeTypeRefs[id] = indexes[index];
            });

            newProject.data[nodeType].byId[nodeId][prop] = nodeTypeRefs;
          }
        });
        break;
      default:
        break;
    }
  });
});

let data = JSON.stringify(newProject, null, 2);
fs.writeFileSync('output.json', data);
