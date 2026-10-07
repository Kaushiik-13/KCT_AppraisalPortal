const MAX_FILE_SIZE = 20 * 1024 * 1024;

const extension = (name) =>
  String(name || "")
    .toLowerCase()
    .match(/\.[^.]+$/)?.[0] || "";
const clean = (text) =>
  String(text || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
const decodeXml = (text) =>
  String(text)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

function assertFile(file) {
  if (!file || !file.size) throw Error("Choose a non-empty evidence file.");
  if (file.size > MAX_FILE_SIZE)
    throw Error(
      "For this prototype, choose an evidence file smaller than 20 MB.",
    );
}

async function readPresentation(file, onProgress) {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
  if (!slideNames.length)
    throw Error("No readable slides were found in this presentation.");
  const sections = [];
  for (let i = 0; i < slideNames.length; i++) {
    onProgress(`Reading slide ${i + 1} of ${slideNames.length}…`);
    const xml = await zip.file(slideNames[i]).async("string");
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((match) => decodeXml(match[1]))
      .filter(Boolean);
    const title = runs[0] || `Slide ${i + 1}`;
    sections.push({
      title,
      text: clean(runs.join("\n")),
      location: { type: "ppt_slide", slide: i + 1 },
    });
  }
  return {
    format: "pptx",
    fileName: file.name,
    sections,
    warnings: sections
      .filter((s) => !s.text)
      .map((s) => `Slide ${s.location.slide} has no extractable text.`),
  };
}

async function readWorkbook(file, onProgress) {
  const XLSX = await import("@e965/xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
    dense: true,
  });
  const sections = [];
  for (let i = 0; i < workbook.SheetNames.length; i++) {
    const name = workbook.SheetNames[i];
    onProgress(`Reading sheet ${i + 1} of ${workbook.SheetNames.length}…`);
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      blankrows: false,
    });
    const range = sheet["!ref"] || "A1";
    sections.push({
      title: name,
      text: clean(
        rows
          .map((row) => row.map((value) => String(value ?? "")).join("\t"))
          .join("\n"),
      ),
      rows,
      location: { type: "xlsx_range", sheet: name, range },
    });
  }
  return {
    format: extension(file.name) === ".xls" ? "xls" : "xlsx",
    fileName: file.name,
    sections,
    warnings: sections
      .filter((s) => !s.text)
      .map((s) => `Sheet ${s.title} has no extractable values.`),
  };
}

export async function readEvidence(file, onProgress = () => {}) {
  assertFile(file);
  const ext = extension(file.name);
  if (ext === ".pdf") {
    const { readPaper } = await import("./pdfReader");
    const paper = await readPaper(file, onProgress);
    return {
      ...paper,
      format: "pdf",
      fileName: file.name,
      sections: (paper.pages || []).map((page) => ({
        title: `Page ${page.number}`,
        text: page.text || "",
        location: { type: "pdf_page", page: page.number },
      })),
      warnings: (paper.pages || [])
        .filter((page) => !page.text?.trim())
        .map((page) => `Page ${page.number} has no extractable text.`),
      paper,
    };
  }
  if ([".ppt", ".pps"].includes(ext))
    throw Error(
      "Legacy .ppt files are not supported by this browser prototype. Save the presentation as .pptx and try again.",
    );
  if ([".pptx", ".ppsx"].includes(ext))
    return readPresentation(file, onProgress);
  if ([".xls", ".xlsx"].includes(ext)) return readWorkbook(file, onProgress);
  throw Error("Extract evidence supports PDF, PPTX, XLS and XLSX files.");
}
