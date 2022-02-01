import { useEffect, useState } from 'react';
import BFSGraphTest from './BFSGraphTest';
import { v4 as uuid4 } from 'uuid';

export default function ForceGraph({ data, viewEditor }) {
  const [nodesData, setNodes] = useState([]);
  const [linksData, setLinks] = useState([]);
  const [graphWithIds, setGraphWithIds] = useState();

  const generateDomSafeId = () => `id-${uuid4()}`

  useEffect(() => {
    const graph = data.graph;
    const nodeNamesToIds = {};
    const nodes = [];
    const links = [];
    const idGraph = {};

    Object.keys(graph).forEach(nodeName => {
      if(!nodeNamesToIds[nodeName]) {
        nodeNamesToIds[nodeName] = generateDomSafeId();
      } 
      
      idGraph[nodeNamesToIds[nodeName]] = [];
      nodes.push({
        name: nodeName,
        id: nodeNamesToIds[nodeName],
        active: false,
      });

      graph[nodeName].forEach(neighbor => {
        if(!nodeNamesToIds[neighbor]) {
          nodeNamesToIds[neighbor] = generateDomSafeId();
        }

        idGraph[nodeNamesToIds[nodeName]].push(nodeNamesToIds[neighbor]);
        links.push({
          id: generateDomSafeId(),
          target: nodeNamesToIds[neighbor],
          source: nodeNamesToIds[nodeName]
        });
      });
    });


    setNodes(nodes);
    setLinks(links);
    setGraphWithIds(idGraph);
  }, [data]);

  return (
    <BFSGraphTest links={linksData} nodes={nodesData} graph={graphWithIds} viewEditor={viewEditor} starting={''}/>
  );
}
