import React from 'react';
import './ArcReactor.css';

const ArcReactor = () => {
  const marks = Array.from({ length: 60 }, (_, i) => <li key={i}></li>);

  return (
    <div className="arc-reactor-container">
      <div className="arc_reactor">
        <div className="case_container">
          <div className="e7">
            <div className="semi_arc_3 e5_1">
              <div className="semi_arc_3 e5_2">
                <div className="semi_arc_3 e5_3">
                  <div className="semi_arc_3 e5_4">
                    <div className="semi_arc_3 e5_5">
                      <div className="semi_arc_3 e5_6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="core2"></div>
          </div>
          <ul className="marks">
            {marks}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArcReactor;
