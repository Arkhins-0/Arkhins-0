/** A project's guest character: shown on its card, in its page's corner, and throughout its page. */
export type Guest = {
  name: string;
  series: string;
  line: string;
  /** Full-figure cut-out used on cards and in the corner of the project page. */
  image: string;
  /** Square face crop, for small avatars. */
  face?: string;
  /** Pose pictures placed throughout the project page (transparent cut-outs; GIFs work too). */
  poses?: string[];
};
