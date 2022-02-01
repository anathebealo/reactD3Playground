import { useState } from 'react';
import ForceGraph from './ForceGraph';
import JSONInput from 'react-json-editor-ajrm';
import { data } from './ForceGraph/data';

export default function GraphAlgorithms() {
  const [graph, setGraph] = useState(data);
  const [graphEdit, setGraphEdit] = useState(data);
  const [viewEditor, setViewEditor] = useState()

  const toggleViewEditor = () => {
    setViewEditor(!viewEditor);
  }

  const updateGraph = (graph) => {
    if(!graph.error) {
      setGraphEdit(JSON.parse(graph.json));
    }
  }

  const viewNewGraph = () => {
    toggleViewEditor();
    setGraph(graphEdit);
  }

  return <div>
    {viewEditor 
    ? <div>
        <h3>Change the Graph</h3>
        <JSONInput
          id          = 'a_unique_id'
          placeholder = { graph }
          theme       = 'light_mitsuketa_tribute'
          height      = '550px'
          onChange    = {updateGraph}
        />
        <button onClick={viewNewGraph}>Use Graph</button>
      </div>
    : <ForceGraph data={graph} viewEditor={toggleViewEditor} />
    }
  </div>
}