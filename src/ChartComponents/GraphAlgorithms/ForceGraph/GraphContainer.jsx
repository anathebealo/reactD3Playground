import { forwardRef, useRef, useEffect, useImperativeHandle, useCallback } from 'react';
import * as d3 from "d3";
import styles from "./graphAnimation.module.css";
import runForceGraph from "./graphAnimation";

const GraphContainer = forwardRef(({links, nodes, starting, graphOptions}, ref) => {
  useImperativeHandle(ref, () => ({
    visitNode(id) {
      d3.select(convertToId(id)).attr("class", styles.visited);
    },
    makeNodeDefault(id) {
      d3.select(convertToId(id)).attr("class", styles.default);
    },
    makeNodeNeighbor(id) {
      d3.select(convertToId(id)).attr("class", styles.neighbor);
    },
    makeNodeActiveNeighbor(id) {
      d3.select(convertToId(id)).attr("class", styles.activeNeighbor);
    },
    makeNodeVisitedNeighbor(id) {
      d3.select(convertToId(id)).attr("class", styles.neighborVisited)
    },
    makeNodeActiveVisitedNeighbor(id) {
      d3.select(convertToId(id)).attr("class", styles.activeNeighborVisited)
    },
    makeNodeStarting(id) {
      d3.select(convertToId(id)).attr("class", styles.startingNode);
    },
    makeLinkInactive(id) {
      d3.select(convertToId(id)).attr("class", styles.inactiveLink);
    },
    makeLinkActive(id) {
      d3.select(convertToId(id)).attr("class", styles.activeLink);
    },
    makeLinkVisited(id) {
      console.log('make link visited');
      d3.select(convertToId(id)).attr("class", styles.visitedLink);
    },
    drawGraph() {
      drawGraphOuterScope();
    },
    restart() {
      if(typeof containerRef === 'Node') {
        containerRef.current.removeChild(containerRef.current.children[0]);
      }
    }
  }));

  const convertToId = (id) => {
    return `#${id}`;
  }

  const containerRef = useRef(null);
  const effectHasRunRef = useRef(false);

  const drawGraphOuterScope = useCallback(() => {
    if (containerRef.current) {
      if(containerRef.current.children.length > 0) {
        containerRef.current.removeChild(containerRef.current.children[0]);
      }
      runForceGraph(containerRef.current, links, nodes, starting, graphOptions.directedGraph);
    }
  }, [containerRef, graphOptions, links, nodes, starting]);

  useEffect(()=>{
    if (effectHasRunRef.current === true) {
      return;
    }
    else if(!nodes || !links || nodes.length === 0 || links.length === 0) {
      return;
    }
    else {
      drawGraphOuterScope();
      effectHasRunRef.current = true;
    }
  },[drawGraphOuterScope, nodes, links]);

  return <div ref={containerRef} className={styles.container} />
});

export default GraphContainer;