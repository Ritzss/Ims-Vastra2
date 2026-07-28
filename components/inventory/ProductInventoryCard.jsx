"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge";

import {
  ChevronDown,
  Package,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductInventoryCard({
  inventory,
  warehouse,
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>
            Product #{inventory.productId}
          </CardTitle>

          <Badge>
            {inventory.totalQuantity} pcs
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          {warehouse?.name}
        </p>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple">
          {inventory.variants.map((variant) => (
            <AccordionItem
              key={variant.color}
              value={variant.color}
            >
              <AccordionTrigger>

                <div className="flex gap-3 items-center">

                  <Package className="w-4 h-4"/>

                  {variant.color}

                </div>

              </AccordionTrigger>

              <AccordionContent>

                {variant.designs.length > 0 ? (

                  variant.designs.map((design)=>(
                    <div
                      key={design.design}
                      className="mb-5"
                    >

                      <h4 className="font-medium mb-2">

                        {design.design}

                      </h4>

                      <div className="space-y-2">

                        {design.sizes.map((size)=>(
                          <div
                            key={size.size}
                            className="flex justify-between rounded-lg border p-3"
                          >

                            <span>{size.size}</span>

                            <Badge>

                              {size.quantity}

                            </Badge>

                          </div>
                        ))}

                      </div>

                    </div>
                  ))

                ) : (

                  <div className="space-y-2">

                    {variant.sizes.map((size)=>(
                      <div
                        key={size.size}
                        className="flex justify-between rounded-lg border p-3"
                      >

                        <span>{size.size}</span>

                        <Badge>

                          {size.quantity}

                        </Badge>

                      </div>
                    ))}

                  </div>

                )}

              </AccordionContent>

            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}