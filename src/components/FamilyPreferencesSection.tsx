
import React from "react";
import { FamilyPreference } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FamilyPreferencesSectionProps {
  preferences: FamilyPreference[];
  onEditPreference: (preference: FamilyPreference) => void;
}

export const FamilyPreferencesSection = ({
  preferences,
  onEditPreference,
}: FamilyPreferencesSectionProps) => {
  return (
    <section id="family-preferences" className="py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-tomato-dark">Family Preferences</h2>
          <Button variant="outline">Add Family Member</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preferences.map((preference) => (
            <Card key={preference.id} className="h-full">
              <CardHeader>
                <CardTitle>{preference.familyMember}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Likes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {preference.likes.map((like, index) => (
                        <Badge key={index} variant="outline" className="bg-green-100">
                          {like}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Dislikes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {preference.dislikes.length > 0 ? (
                        preference.dislikes.map((dislike, index) => (
                          <Badge key={index} variant="outline" className="bg-red-100">
                            {dislike}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">None specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Allergies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {preference.allergies.length > 0 ? (
                        preference.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Dietary Preferences:</h4>
                    <div className="flex flex-wrap gap-1">
                      {preference.dietaryPreferences.length > 0 &&
                      preference.dietaryPreferences[0] !== "none" ? (
                        preference.dietaryPreferences.map((diet, index) => (
                          <Badge key={index} variant="secondary">
                            {diet}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => onEditPreference(preference)}
                  >
                    Edit Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
