
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color: string;
}

const ActionCard = ({ title, description, icon: Icon, to, color }: ActionCardProps) => {
  return (
    <Link to={to}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full opacity-10 ${color}`} />
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${color} text-white mr-3`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ActionCard;
