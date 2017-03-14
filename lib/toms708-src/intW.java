/**
 * f2j object wrapper for integers.
 * <p>
 * This file is part of the Fortran-to-Java (f2j) system,
 * developed at the University of Tennessee.
 * <p>
 * This class acts as an object wrapper for passing integer
 * values by reference in f2j translated files.
 * <p>
 * @author Keith Seymour (seymour@cs.utk.edu)
 *
 */

public class intW {
  public int val;

  /**
   * Create a new int wrapper.
   *
   * @param x the initial value
   */
  public intW(int x) {
     val = x;
  }
}
