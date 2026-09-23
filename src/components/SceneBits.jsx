export function SceneBits({ id }) {
  if (id === 'space') {
    return (
      <div className="bits" aria-hidden="true">
        <i className="dot d1" /><i className="dot d2" /><i className="dot d3" /><i className="dot d4" />
      </div>
    );
  }
  if (id === 'ocean') {
    return (
      <div className="bits" aria-hidden="true">
        <i className="fish f1" /><i className="fish f2" /><i className="bubble b1" />
      </div>
    );
  }
  if (id === 'forest') {
    return (
      <div className="bits" aria-hidden="true">
        <i className="fly y1" /><i className="fly y2" /><i className="fly y3" />
      </div>
    );
  }
  if (id === 'castle') {
    return (
      <div className="bits" aria-hidden="true">
        <i className="flag" /><i className="tower" />
      </div>
    );
  }
  if (id === 'lab') {
    return <div className="bits lab-grid" aria-hidden="true" />;
  }
  return (
    <div className="bits" aria-hidden="true">
      <i className="cloud c1" /><i className="cloud c2" /><i className="hill" />
    </div>
  );
}
