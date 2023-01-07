import re
import json

class Point:
  name = ""
  x = 0
  y = 0
  z = 0

  def __init__(self, name, x, y, z):
    self.name = name
    self.x = float(x)
    self.y = float(y)
    self.z = float(z)

  def export(self):
    return {
      'purePoints': [self.x, -self.y, self.z]
    }


class Shape:

  points = []

  def __init__(self, points):
    self.points = points

  def export(self):

    return {
      'shapeId': '',
      'points': [p.export() for p in self.points],
      'properties': {
        'shapeColor': '#0000ff',
        'alpha': '1',
        'lineWidth': 1,
        'hoverColor': 'red',
        '_fillColorHex': '#00ffff'
      },
      'shapeTypeId': self.getShapeTypeId()
    }

  def getShapeTypeId(self):

    match len(self.points):
      case 2: return 1
      case 3: return 2
      case 4: return 3
      case a if len(self.points) > 4:
        return 4


lines: list[str] = []
with open("coords.txt", "r") as f:
  lines = f.readlines()

def isPointDefinition(line: str) -> bool:
  return line.find("(") != -1

def isShapeDefinition(line: str) -> bool:
  return line.find("-") != -1


points: list[Point] = []
shapes: list[Shape] = []
for line in lines:

  if isPointDefinition(line):
    result = re.search(r"(\w)\((\d+), (\d+), (\d+)\)", line)
    p = Point(result.group(1), result.group(2), result.group(3), result.group(4))
    points.append(p)
  elif isShapeDefinition(line):
    pointNames = line.split("-")

    searchedPoints: list[Point] = []
    for pointName in pointNames:
      for point in points:
        if point.name == pointName:
          searchedPoints.append(point)
          break
    
    shapes.append(Shape(searchedPoints))

with open('generated.json', 'w') as f:
  f.write(json.dumps([shape.export() for shape in shapes]))