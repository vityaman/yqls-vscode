// @ts-expect-error Using JS code
import clj from '@chrisoakman/standard-clojure-style'

interface FormatResult {
  status: string
  out: string
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const formatClojure: (text: string) => FormatResult = clj.format
