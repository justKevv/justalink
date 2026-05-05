import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Navbar } from "./components/ui/navbar";
import { Card, CardContent } from "./components/ui/card";
import { Copy, CopyCheck, RefreshCcw, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { generateCode } from "./lib/generateCode";

function App() {
  const baseUrl = window.location.origin;
  const [shortenedData, setShortenedData] = useState<{ code: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const formSchema = z.object({
    url: z.url("Please enter a valid URL"),
    code: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      code: "",
    },
  });

  const urlValue = useWatch({ control: form.control, name: "url" });

  useEffect(() => {
    if (urlValue) {
      try {
        new URL(urlValue);
        const generatedCode = generateCode();
        form.setValue("code", generatedCode);
      } catch {
        // not generate anything
      }
    }
  }, [urlValue]);

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const handleCopyLink = () => {
    if (shortenedData) {
      const shortlink = `${baseUrl}/${shortenedData.code}`;
      navigator.clipboard.writeText(shortlink);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
        setShortenedData(null);
        form.reset();
      }, 3000);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("url", values.url);
    formData.append("code", values.code);

    try {
      const res = await fetch(`${baseUrl}/shorten`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setShortenedData(data);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
      form.setError("url", {
        type: "manual",
        message: "Failed to shorten URL. Please try again.",
      });
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center px-6 py-12 gap-7">
        <h2 className="text-5xl text-center flex flex-col gap-3">
          <span>just a</span>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-chart-3 text-white">link</span>
            <span className="px-3 py-1.5 bg-chart-2 text-white">shortener</span>
          </div>
        </h2>
        <Card className="w-fit py-2 px-4 rounded-none text-[16px] rotate-z-1">
          paste a url. get a short link. that's it.
        </Card>
        <p className="font-normal">All links are saved in your browser</p>
        <Card className="bg-main/10 w-full max-w-2xl">
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YOUR LONG URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            disabled={shortenedData !== null}
                            placeholder="https://jstkev.in/"
                            {...field}
                          />
                        </FormControl>
                        <Button type="submit" disabled={shortenedData !== null}>
                          <SendIcon /> Shorten
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CUSTOM CODE (optional)</FormLabel>
                      <div className="flex flex-row gap-3 items-center">
                        <div className="flex flex-row">
                          <Card className="whitespace-nowrap px-4 py-0 items-center justify-center">
                            {baseUrl}/
                          </Card>
                          <FormControl>
                            <Input
                              disabled={
                                !form.getValues("url") ||
                                !isValidUrl(form.getValues("url")) ||
                                shortenedData !== null
                              }
                              placeholder="auto-generated"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          disabled={!form.getValues("url") || !isValidUrl(form.getValues("url"))}
                          onClick={() => {
                            const url = form.getValues("url");
                            try {
                              new URL(url);
                              const generatedCode = generateCode();
                              form.setValue("code", generatedCode);
                            } catch {
                              form.setError("url", {
                                type: "manual",
                                message: "Please enter a valid URL first",
                              });
                            }
                          }}
                        >
                          <RefreshCcw />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
        {shortenedData && (
          <Card className="bg-chart-4/20 w-full max-w-2xl flex flex-row items-center justify-between p-4">
            <div>
              <p className="text-green-800">✓ your short link</p>
              <p className="font-bold">
                {baseUrl}/{shortenedData.code}
              </p>
            </div>
            <Button
              className="bg-white"
              variant={isCopied ? "noShadow" : "neutral"}
              onClick={handleCopyLink}
              disabled={isCopied}
            >
              {isCopied ? "Copied" : "Copy Link"} {isCopied ? <CopyCheck /> : <Copy />}
            </Button>
          </Card>
        )}
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <Card className="py-0.5 px-4 text-[14px]">RECENT LINKS</Card>
            <p>3 links</p>
          </div>
          <Card className="py-3">
            <CardContent className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-3 items-center">
                <p className="bg-main px-1 border-2 border-border">01</p>
                <div>
                  <p className="text-chart-2">{baseUrl}/dQw4w9</p>
                  <p className="font-light">https://youtube.com/watch?v=dQw4w9WgXcQ</p>
                </div>
              </div>
              <Button variant="neutral">
                <Copy />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default App;
