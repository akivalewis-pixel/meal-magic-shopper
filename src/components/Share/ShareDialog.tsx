import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: "meal-plan" | "daily-plan" | "recipe" | "shopping-list";
}

export const ShareDialog = ({ isOpen, onClose, title, content, type }: ShareDialogProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getSubject = () => {
    switch (type) {
      case "meal-plan": return "Weekly Meal Plan from Pantry Pilot";
      case "daily-plan": return "Daily Meal Plan from Pantry Pilot";
      case "recipe": return "Recipe from Pantry Pilot";
      case "shopping-list": return "Shopping List from Pantry Pilot";
    }
  };

  const getFullMessage = () => {
    const customMessage = message ? `${message}\n\n` : "";
    return `${customMessage}${title}\n\n${content}\n\nShared via Pantry Pilot`;
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(getSubject());
    const body = encodeURIComponent(getFullMessage());
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleSMSShare = () => {
    const body = encodeURIComponent(getFullMessage());
    const smsUrl = `sms:${phone}?body=${body}`;
    window.open(smsUrl, '_blank');
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFullMessage());
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Add a personal message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Share via Email</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  onClick={handleEmailShare}
                  disabled={!email}
                  className="shrink-0"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Share via Text Message</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button 
                  onClick={handleSMSShare}
                  disabled={!phone}
                  variant="outline"
                  className="shrink-0"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button 
                onClick={handleCopyToClipboard}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
            <p className="text-sm font-medium mb-1">Preview:</p>
            <p className="text-xs text-gray-600 whitespace-pre-wrap">{getFullMessage()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};