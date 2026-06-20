'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export const Sketch = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let p5Instance: any

    // p5 is a browser-only library; import it lazily so SSR never touches it.
    let cancelled = false
    import('p5').then(({ default: p5 }) => {
      if (cancelled || !containerRef.current) return

      const sketch = (p: any) => {
        interface Square {
          x: number
          y: number
          width: number
          height: number
          color?: string
        }

        let squares: Square[] = []
        let canvasSize: number
        const white = '#F2F5F1'
        const colors = ['#0891B2', '#059669', '#22D3EE'] // Brand: cyan, green, light cyan

        const measure = () =>
          containerRef.current
            ? Math.min(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight,
              )
            : 320

        p.setup = () => {
          canvasSize = measure()
          p.createCanvas(canvasSize, canvasSize)
          generateMondrian()
        }

        p.draw = () => {
          drawMondrian()
          p.noLoop()
        }

        const generateMondrian = () => {
          const size = canvasSize
          const step = size / 7

          squares = [{ x: 0, y: 0, width: size, height: size }]

          for (let i = step; i < size; i += step) {
            splitSquaresWith({ y: i })
            splitSquaresWith({ x: i })
          }

          const numColored = p.floor(p.random(3, 6))
          for (let i = 0; i < numColored; i++) {
            const randomSquare = squares[p.floor(p.random(squares.length))]
            randomSquare.color = colors[i % colors.length]
          }
        }

        const splitSquaresWith = (coordinates: { x?: number; y?: number }) => {
          const { x, y } = coordinates

          for (let i = squares.length - 1; i >= 0; i--) {
            const square = squares[i]

            if (x && x > square.x && x < square.x + square.width) {
              if (p.random() > 0.5) {
                squares.splice(i, 1)
                splitOnX(square, x)
              }
            }

            if (y && y > square.y && y < square.y + square.height) {
              if (p.random() > 0.5) {
                squares.splice(i, 1)
                splitOnY(square, y)
              }
            }
          }
        }

        const splitOnX = (square: Square, splitAt: number) => {
          squares.push({
            x: square.x,
            y: square.y,
            width: square.width - (square.width - splitAt + square.x),
            height: square.height,
          })
          squares.push({
            x: splitAt,
            y: square.y,
            width: square.width - splitAt + square.x,
            height: square.height,
          })
        }

        const splitOnY = (square: Square, splitAt: number) => {
          squares.push({
            x: square.x,
            y: square.y,
            width: square.width,
            height: square.height - (square.height - splitAt + square.y),
          })
          squares.push({
            x: square.x,
            y: splitAt,
            width: square.width,
            height: square.height - splitAt + square.y,
          })
        }

        const drawMondrian = () => {
          p.background(255)
          p.strokeWeight(8)
          p.stroke(20, 40, 50)

          for (let i = 0; i < squares.length; i++) {
            const square = squares[i]
            p.fill(square.color ?? white)
            p.rect(square.x, square.y, square.width, square.height)
          }
        }

        p.windowResized = () => {
          canvasSize = measure()
          p.resizeCanvas(canvasSize, canvasSize)
          squares = []
          generateMondrian()
          p.redraw()
        }

        p.mousePressed = () => {
          squares = []
          generateMondrian()
          p.redraw()
        }
      }

      p5Instance = new p5(sketch, containerRef.current)
    })

    return () => {
      cancelled = true
      if (p5Instance) p5Instance.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('flex items-center justify-center w-full h-full', className)}
    />
  )
}
