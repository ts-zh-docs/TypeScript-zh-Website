import { defineMessages } from "react-intl"
import { playCopy } from "./playground"
import { messages as englishMessages } from "../en/en"
import { navCopy } from "./nav"
import { headCopy } from "./head-seo"
import { docCopy } from "./documentation"
import { indexCopy } from "./index2"
import { comCopy } from "./community"
import { handbookCopy } from "./handbook"
import { footerCopy } from "./footer"

export const lang = defineMessages({
  ...englishMessages,
  ...navCopy,
  ...docCopy,
  ...headCopy,
  ...indexCopy,
  ...playCopy,
  ...comCopy,
  ...handbookCopy,
  ...footerCopy
})
