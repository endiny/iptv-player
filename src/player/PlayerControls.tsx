import { Button } from "@/components/ui/button";

export const PlayerControls: React.FC = () => {
  return (
    <div className="flex justify-center space-x-4 bg-black bg-opacity-50 text-white p-4 rounded">
      <Button variant="outline" size="icon-lg" className="rounded-full">
        {'<<'}
      </Button>
      <Button variant="outline" size="icon-lg" className="rounded-full">
        P/P
      </Button>
      <Button variant="outline" size="icon-lg" className="rounded-full">
        {'>>'}
      </Button>
    </div>
  );
};
