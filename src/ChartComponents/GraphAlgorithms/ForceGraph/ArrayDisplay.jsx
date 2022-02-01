import { css, cx } from '@emotion/css';

const container = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  margin-left: 10px;
`;

const arrayDiv = css`
  display: flex;
  flex-direction: row;
  height: 50px;
  padding: 10px;
  margin-left: 10px;
  min-width: 60px;
`;

const outlineArray = css`
  border: solid 2px blue;
  border-radius: 10px;
`;

const cell = css`
  height: 50px;
  width: 50px;
  border: 1px solid black;
  border-radius: 10px;
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const highlightCell = css`
  background-color: rgb(248, 169, 65);
`;

export default function ArrayDisplay({name, nodes, highlightArray, highlightIndex}) {
  return (
    <div className={container}>
      <span>{name}</span>
      <div className={highlightArray ? cx(arrayDiv, outlineArray): arrayDiv}>
        {nodes.map((x, i) => 
          <div key={x} className={highlightIndex && highlightIndex === i ? cx(cell, highlightCell): cell}>
            {x}
          </div>
        )}
      </div>
    </div>
  );
}
