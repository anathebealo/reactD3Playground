import { useEffect, useRef, useState, useCallback } from 'react';
import GraphContainer from "./GraphContainer";
import ArrayDisplay from './ArrayDisplay';
import { css } from '@emotion/css';

const START = 'start';
const SET_CURRENT = 'set current';
const FIND_NEIGHBORS = 'find neighbors';
const CHECK_VISITED = 'check visited';
const ADD_TO_QUEUE = 'add to queue';
const DONT_ADD_TO_QUEUE = 'dont add to queue';

const highlightedP = css`
  background-color: yellow;
  margin: 0px;
`;

const notHighlightedP = css`
  margin: 0px;
`;

const codeBlock = css`
  text-align: left;
  font-family: monospace;
  font-size: 16px;
  margin-left: 20px;
`;

const flexRow = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const flexCol = css`
  display: flex;
  flex-direction: column;
`;

const BFSGraphTest = ({links, nodes, graph, viewEditor}) => {
  const graphRef = useRef();

  const [nodeNameDict, setNodeNameDict] = useState({});
  const [bfsQueue, setBfsQueue] = useState([]);
  const [visited, setVisited] = useState({});
  const [startingNode, setStartingNode] = useState();
  const [bfsSteps, setBfsSteps] = useState([]);

  const [clickThroughBfsSteps, setClickThroughBfsSteps] = useState([]);
  const [animateBfsSteps, setAnimateBfsSteps] = useState([]);

  const [step, setStep] = useState('');
  const [visitedState, setVisitedState] = useState({ visitedList: []});
  const [visitIterations, setVisitIterations] = useState({});
  const [queueState, setQueueState] = useState({ queueList: []});
  const [startAnimating, setStartAnimating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isClickThrough, setIsClickThrough] = useState(false);
  
  const latestStartingNode = useRef(startingNode);

  useEffect(() => {
    const dict = {};
    nodes.forEach(node => {
      dict[node.id] = node.name;
    });
    setNodeNameDict(dict);
  }, [nodes, setNodeNameDict]);

  const restart = useCallback(() => {
    graphRef.current.restart();
    setBfsQueue([]);
    setClickThroughBfsSteps([]);
    setAnimateBfsSteps([]);

    setVisited({});
    setStartingNode();

    setIsAnimating(false);
    setIsClickThrough(false);
    setIsPaused(false);
    setStep('');

    latestStartingNode.current = null;

    setVisitedState({ visitedList: []});
    setQueueState({ queueList: []});

    graphRef.current.drawGraph();
  }, []);
  
  const changeGraph = () => {
    restart();
    viewEditor();
  }

  useEffect(() => {
    console.log('restarting');
    restart();
  }, [nodes, links, restart]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  }

  const starting = (id) => {
    if(latestStartingNode.current) {
      graphRef.current.makeNodeDefault(latestStartingNode.current);
    }

    graphRef.current.makeNodeStarting(id);
    setStartingNode(() => {
      // hack to allow for closure value updating :(
      latestStartingNode.current = id;
      return id;
    });
    setBfsQueue([id]);
    setVisited({ [id]: true });
  }

  const getAllBfsSteps = useCallback(() => {
    const bfsIteration = [];
    const bfsQueueCopy = JSON.parse(JSON.stringify(bfsQueue));
    const visitedCopy = JSON.parse(JSON.stringify(visited));
    const visitedIterations = {[nodeNameDict[bfsQueue[0]]]: 1};

    bfsIteration.push({ 
      step: START,
      current: '',
      queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
      visited: JSON.parse(JSON.stringify(visitedCopy)),
    });
    let iteration = 1;
    while(bfsQueueCopy.length > 0) {
      iteration += 1;
      const currentNode = bfsQueueCopy.shift();
      bfsIteration.push({ 
        step: SET_CURRENT,
        current: currentNode,
        queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
        visited: JSON.parse(JSON.stringify(visitedCopy)),
      });

      bfsIteration.push({ 
        step: FIND_NEIGHBORS,
        current: currentNode,
        neighbors: graph[currentNode],
        links: links.filter(link => link.source === currentNode || link.target === currentNode).map(link => link.id),
        queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
        visited: JSON.parse(JSON.stringify(visitedCopy)),
      });
      for(let i = 0; i<graph[currentNode].length; i++) {
        const neighbor = graph[currentNode][i];

        const neighborLinks = links.filter(link => (link.source === currentNode && link.target === neighbor) || (link.source === neighbor && link.target === currentNode)).map(link => link.id);
        bfsIteration.push({ 
          step: CHECK_VISITED,
          current: currentNode,
          neighbor: neighbor,
          links: neighborLinks,
          queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
          visited: JSON.parse(JSON.stringify(visitedCopy)),
        });
        if(!visitedCopy[neighbor]) {
          bfsQueueCopy.push(neighbor);
          visitedCopy[neighbor] =  true;
          visitedIterations[nodeNameDict[neighbor]] = iteration;

          bfsIteration.push({ 
            step: ADD_TO_QUEUE,
            current: currentNode,
            links: neighborLinks,
            neighbor: neighbor,
            queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
            visited: JSON.parse(JSON.stringify(visitedCopy)),
          });
        } else {
          bfsIteration.push({ 
            step: DONT_ADD_TO_QUEUE,
            current: currentNode,
            links: neighborLinks,
            neighbor: neighbor,
            queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
            visited: JSON.parse(JSON.stringify(visitedCopy)),
          });
        }
      };
      
      bfsIteration.push({ 
        step: START,
        current: currentNode,
        queue: JSON.parse(JSON.stringify(bfsQueueCopy)),
        visited: JSON.parse(JSON.stringify(visitedCopy)),
      });
    }

    setBfsSteps(bfsIteration);
    setClickThroughBfsSteps(bfsIteration);
    setAnimateBfsSteps(bfsIteration);
    setVisitIterations(visitedIterations);
  }, [bfsQueue, graph, links, nodeNameDict, visited]);

  useEffect(() => {
    if(startAnimating && !startingNode) {
      setStartAnimating(false);
      return;
    }
    if(!startAnimating || !startingNode ) {
      return;
    }
    setIsAnimating(true);

    let bfsStepsCopy = JSON.parse(JSON.stringify(animateBfsSteps));
    const handle = setInterval(() => {
      if(!isPaused) {
        if(bfsStepsCopy.length) {
          let bfsStep = bfsStepsCopy.shift();
          handleStep(bfsStep);
          setAnimateBfsSteps(bfsStepsCopy)
        } else {
          clearInterval(handle);
          setIsAnimating(false);
        }
      }
    }, 500);
    return () => { 
      clearInterval(handle);
      setIsAnimating(false);
    }
  }, [startAnimating, bfsSteps, isPaused, startingNode, animateBfsSteps]);

  const handleStep = (bfsStep) => {
    switch(bfsStep.step) {
      case START:
        setQueueState({
          highlightList: true,
          queueList: bfsStep.queue
        });
        setVisitedState({
          visitedList: bfsStep.visited
        });
        setStep(bfsStep.step);
        break;
      case SET_CURRENT:
        setStep(bfsStep.step);
        setQueueState({
          highlightList: false,
          highlightNodeIndex: 0,
          queueList: bfsStep.queue
        });
        setVisitedState({
          visitedList: bfsStep.visited
        });
        graphRef.current.visitNode(bfsStep.current);
        break;
      case FIND_NEIGHBORS:
        setStep(bfsStep.step);
        setQueueState({
          highlightList: false,
          queueList: bfsStep.queue
        });
        setVisitedState({
          visitedList: bfsStep.visited
        });
        bfsStep.links.forEach(link => {
          graphRef.current.makeLinkVisited(link);
        });
        bfsStep.neighbors.forEach(neighbor => {
          if(bfsStep.visited[neighbor]) {
            graphRef.current.makeNodeVisitedNeighbor(neighbor);
          } else {
            graphRef.current.makeNodeNeighbor(neighbor);
          }
        });
        break;
      case CHECK_VISITED:
        setQueueState({
          highlightList: false,
          queueList: bfsStep.queue
        });
        setVisitedState({
          visitedList: bfsStep.visited,
          highlightNodeIndex: bfsStep.visited[bfsStep.neighbor] ? Object.keys(bfsStep.visited).indexOf(bfsStep.neighbor) : undefined
        });
        bfsStep.links.forEach(link => {
          graphRef.current.makeLinkActive(link);
        });

        if(bfsStep.visited[bfsStep.neighbor]) {
          graphRef.current.makeNodeActiveVisitedNeighbor(bfsStep.neighbor);
        } else {
          graphRef.current.makeNodeActiveNeighbor(bfsStep.neighbor);
        }
        setStep(bfsStep.step);
        break;
      case ADD_TO_QUEUE:
        setQueueState({
          highlightList: false,
          highlightNodeIndex: bfsStep.queue.length - 1,
          queueList: bfsStep.queue
        });
        setVisitedState({
          visitedList: bfsStep.visited
        });
        bfsStep.links.forEach(link => {
          graphRef.current.makeLinkInactive(link);
        });
        if(!bfsStep.queue.includes(bfsStep.neighbor)) {
          graphRef.current.visitNode(bfsStep.neighbor);
        } else {
          graphRef.current.makeNodeDefault(bfsStep.neighbor);
        }
        setStep(bfsStep.step);
        break;
      case DONT_ADD_TO_QUEUE:
        setQueueState({
          highlightList: false,
          queueList: bfsStep.queue
        });
        setVisitedState({
          visitedList: bfsStep.visited,
          highlightNodeIndex: bfsStep.visited[bfsStep.neighbor] ? Object.keys(bfsStep.visited).indexOf(bfsStep.neighbor) : undefined
        });
        bfsStep.links.forEach(link => {
          graphRef.current.makeLinkInactive(link);
        });
        if(!bfsStep.queue.includes(bfsStep.neighbor)) {
          graphRef.current.visitNode(bfsStep.neighbor);
        } else {
          graphRef.current.makeNodeDefault(bfsStep.neighbor);
        }
        break;
      default:
        break;
    }
  }
  const clickMe = () => {
    if(!startingNode) {
      return;
    }
    if(!isClickThrough) {
      setIsClickThrough(true);
    }

    const bfsQueueCopy = JSON.parse(JSON.stringify(clickThroughBfsSteps));
    if(bfsQueueCopy.length) {
      let bfsStep = bfsQueueCopy.shift();
      handleStep(bfsStep);

      setClickThroughBfsSteps(bfsQueueCopy);
    }
  }

  useEffect(() => {
    if(bfsQueue.length > 0) {
      getAllBfsSteps();
    }
  }, [bfsQueue, visited, getAllBfsSteps]);

  return <div className={flexCol}>
    <div className={flexRow}>
      <div>
        <button onClick={changeGraph}>Change Graph</button>
        <button onClick={clickMe} disabled={isAnimating || !startingNode}> click me </button>
        <button onClick={restart}> restart </button>
        <button onClick={() => setStartAnimating(true)} disabled={isAnimating || isClickThrough || !startingNode}>Animate</button>
        <button onClick={togglePause} disabled={!isAnimating}>{isPaused ? 'play' : 'pause'}</button>
        <GraphContainer ref={graphRef} links={links} nodes={nodes} starting={starting} graphOptions={{directedGraph: false}}/>
      </div>
      <div className={codeBlock}>
        <p className={step === START ? highlightedP : notHighlightedP}>while(queue is not empty) {'{'}</p>
        <p className={step === SET_CURRENT ? highlightedP : notHighlightedP}>&ensp;set current node to first in queue</p>
        <p className={step === FIND_NEIGHBORS ? highlightedP : notHighlightedP}>&ensp;for each neighbor of current node {'{'}</p>
        <p className={step === CHECK_VISITED ? highlightedP : notHighlightedP}>&emsp;&ensp;if neighbor is not visited {'{'}</p>
        <p className={step === ADD_TO_QUEUE ? highlightedP : notHighlightedP}>&emsp;&ensp;&ensp;add neighbor to queue</p>
        <p className={notHighlightedP}>&emsp;&ensp;{'}'}</p>
        <p className={notHighlightedP}>&ensp;{'}'}</p>
        <p className={notHighlightedP}>{'}'}</p>
      </div>
    </div>
    <div>
      <ArrayDisplay name={'Visited'} nodes={Object.keys(visitedState.visitedList).map(key => nodeNameDict[key])} highlightArray={false} highlightIndex={visitedState.highlightNodeIndex}/>
      <ArrayDisplay name={'Queue'} nodes={queueState.queueList.map(id => nodeNameDict[id])}  highlightArray={queueState.highlightList} highlightIndex={queueState.highlightNodeIndex} />
    </div>
  </div>
};

export default BFSGraphTest;