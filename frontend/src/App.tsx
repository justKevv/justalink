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
import { Footer } from "./components/ui/footer";

function App() {
  const baseUrl = window.location.origin;
  const [shortenedData, setShortenedData] = useState<{ code: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());
  const [recentLinks, setRecentLinks] = useState<Array<{ code: string; url: string }>>(() => {
    const saved = JSON.parse(localStorage.getItem("recentLinks") || "[]");
    return saved;
  });

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
      }, 2000);
    }
  };

  const handleCopyRecentLink = (code: string) => {
    const shortlink = `${baseUrl}/${code}`;
    navigator.clipboard.writeText(shortlink);

    setCopiedCodes((prev) => new Set(prev).add(code));

    setTimeout(() => {
      setCopiedCodes((prev) => {
        const updated = new Set(prev);
        updated.delete(code);
        return updated;
      });
    }, 2000);
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

      // save to local
      const existing = JSON.parse(localStorage.getItem("recentLinks") || "[]");
      existing.unshift({ code: data.code, url: values.url });
      const updated = existing.slice(0, 10);
      setRecentLinks(updated);
      localStorage.setItem("recentLinks", JSON.stringify(updated));
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
        <h2 className="text-4xl sm:text-5xl text-center flex flex-col gap-3">
          <span>just a</span>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-3 py-1.5 bg-chart-3 text-white">link</span>
            <span className="px-3 py-1.5 bg-chart-2 text-white">shortener</span>
          </div>
        </h2>
        <Card className="w-fit py-2 px-4 rounded-none text-sm sm:text-base rotate-z-1">
          paste a url. get a short link. that's it.
        </Card>
        <p className="font-normal text-sm sm:text-base">All links are saved in your browser</p>
        <Card className="bg-main/10 w-full max-w-2xl px-4 sm:px-6">
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">YOUR LONG URL</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <FormControl>
                          <Input
                            disabled={shortenedData !== null}
                            placeholder="https://jstkev.in/"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="submit"
                          disabled={shortenedData !== null}
                          className="sm:w-auto"
                        >
                          <SendIcon /> <span className="hidden sm:inline">Shorten</span>
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
                      <FormLabel className="text-xs sm:text-sm">CUSTOM CODE (optional)</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                        <div className="flex flex-row min-w-0">
                          <Card className="whitespace-nowrap px-2 sm:px-4 py-0 items-center justify-center text-sm sm:text-base">
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
                          size="icon"
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
          <Card className="bg-chart-4/20 w-full max-w-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-0">
            <div>
              <p className="text-green-800 text-xs sm:text-sm">✓ your short link</p>
              <p className="font-bold text-sm sm:text-base break-all">
                {baseUrl}/{shortenedData.code}
              </p>
            </div>
            <Button
              className="bg-white w-full sm:w-auto"
              variant={isCopied ? "noShadow" : "neutral"}
              onClick={handleCopyLink}
              disabled={isCopied}
            >
              {isCopied ? "Copied" : "Copy Link"} {isCopied ? <CopyCheck /> : <Copy />}
            </Button>
          </Card>
        )}
        <div className="w-full max-w-2xl flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-row justify-between items-center px-2 sm:px-0">
            <Card className="py-0.5 px-3 sm:px-4 text-xs sm:text-sm">RECENT LINKS</Card>
            <p className="text-sm sm:text-base">{recentLinks.length} links</p>
          </div>
          {recentLinks.map((link, index) => (
            <Card key={link.code} className="py-2 sm:py-3 px-3 sm:px-4">
              <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 p-0">
                <div className="flex flex-row gap-2 sm:gap-3 items-start sm:items-center w-full sm:w-auto min-w-0">
                  <p className="bg-main px-1 border-2 border-border text-xs sm:text-base shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="text-chart-2 text-xs sm:text-sm break-all">
                      {baseUrl}/{link.code}
                    </p>
                    <p className="font-light text-xs sm:text-sm break-all">{link.url}</p>
                  </div>
                </div>
                <Button
                  variant={copiedCodes.has(link.code) ? "noShadow" : "neutral"}
                  onClick={() => handleCopyRecentLink(link.code)}
                  disabled={copiedCodes.has(link.code)}
                  size="icon"
                  className="shrink-0"
                >
                  {copiedCodes.has(link.code) ? <CopyCheck /> : <Copy />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
