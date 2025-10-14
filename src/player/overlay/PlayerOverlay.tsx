interface P {
  bottomPanel: React.ReactNode;
  topPanel?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  centerPanel?: React.ReactNode;
}

export const PlayerOverlay: React.FC<P> = (props) => {
  return <div className="flex flex-col h-full w-full fixed text-white">
    {<div className="flex-none">{props.topPanel}</div>}
    <div className="flex-grow flex">
      {<div className="flex-none">{props.leftPanel}</div>}
      <div className="flex-grow flex items-center justify-center">
        {props.centerPanel}
      </div>
      {<div className="flex-none">{props.rightPanel}</div>}
    </div>
    {<div className="flex-none">{props.bottomPanel}</div>}
  </div>;
};
