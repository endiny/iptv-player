interface PlayerOverlayProps {
  bottomPanel: React.ReactNode;
  topPanel?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  centerPanel?: React.ReactNode;
  className?: string;
}

export const PlayerOverlay: React.FC<PlayerOverlayProps> = (props) => {
  return (
    <div
      className={`fixed inset-0 flex flex-col text-white ${props.className ?? ''}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="flex-none">{props.topPanel}</div>
      <div className="flex flex-grow">
        <div className="flex-none">{props.leftPanel}</div>
        <div className="flex flex-grow items-center justify-center">{props.centerPanel}</div>
        <div className="flex-none">{props.rightPanel}</div>
      </div>
      <div className="flex-none">{props.bottomPanel}</div>
    </div>
  );
};
