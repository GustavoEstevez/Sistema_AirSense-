from django.shortcuts import render, redirect

def Home(request):
    return render(request, 'AirSenseClassic.html')

def HomeAI(request):
    return render(request, 'AirSenseAI.html')

def HomeBeta(request):
    return render(request, 'Inicio.html')

def dashboard(request):
    return redirect('dashboard:home')

def historial(request):
    return render(request, 'historial.html')

def documentacion(request):
    return render(request, 'Pages/documentacion.html')

def galeria(request):
    return render(request, 'Pages/Galeria.html')