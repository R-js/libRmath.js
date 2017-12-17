/**
 * f2j object wrapper for doubles.
 * <p>
 * This file is part of the Fortran-to-Java (f2j) system,
 * developed at the University of Tennessee.
 * <p>
 * This class acts as an object wrapper for passing double
 * precision floating point values by reference in f2j 
 * translated files.
 * <p>
 * @author Keith Seymour (seymour@cs.utk.edu)
 *
 */

public class doubleW {
  public double val;

  /**
   * Create a new double wrapper.
   *
   * @param x the initial value
   */
  public doubleW(double x) {
     val = x;
  }
}
