const cheerio = require("cheerio");
const axios = require("axios");
const xlsx = require("xlsx");

// Function to fetch job data from TimesJobs website
async function fetchData() {
  try {
    const response = await axios.get(
      "https://www.timesjobs.com/candidate/job-search.html?searchType=Home_Search&from=submit&asKey=OFF&txtKeywords=&cboPresFuncArea=35"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Function to extract job details from HTML content
function extractJobs(html) {
  const $ = cheerio.load(html);
  const jobData = [];

  $(".clearfix.job-bx.wht-shd-bx").each((idx, ele) => {
    const companyName = $(ele).find("h3.joblist-comp-name").text().trim();

    const salary = $(ele)
      .find("ul.top-jd-dtl.clearfix > li:nth-child(2)")
      .text();

    const location = $(ele)
      .find("ul.top-jd-dtl.clearfix > li:nth-child(3) > span")
      .text();

    const posted = $(ele).find("span.sim-posted").text().split("Posted")[1];

    const description = $(ele)
      .find("ul.list-job-dtl.clearfix > li:first-child")
      .text();

    jobData.push({
      "Company Name": companyName,
      Location: location,
      Description: description,
      Salary: salary,
      "Posted on": `Posted ${posted}`,
    });
  });

  return jobData;
}

// Function to write job data to an Excel file
function excelSheet(data) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Jobs");
  xlsx.writeFile(workbook, "jobs.xlsx");
}

// Main function to orchestrate the scraping process
async function main() {
  const html = await fetchData();
  if (html) {
    const jobData = extractJobs(html);
    excelSheet(jobData);
    console.log("Fetched data successfully");
  } else {
    console.log("Error while fetching data");
  }
}

// Call the scrapeData function to start the scraping process
main();